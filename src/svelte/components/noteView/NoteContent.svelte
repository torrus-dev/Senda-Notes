<script lang="ts">
import Title from "./Title.svelte";
import Metadata from "./Metadata.svelte";
import Properties from "@components/properties/Properties.svelte";
import ChildNotes from "./ChildNotes.svelte";
import Editor from "./editor/Editor.svelte";

import { settingsController } from "@controllers/settingsController.svelte";
import type { Note } from "@projectTypes/noteTypes";
import { searchController } from "@controllers/searchController.svelte";

let { note }: { note: Note } = $props();
</script>

<div
   class="scroll overflow-auto
   {searchController.isSearching ? 'overflow-hidden' : ''}">
   <article class="relative py-4">
      {#if searchController.isSearching}
         <div class="bg-base-100/60 absolute top-0 left-0 z-90 h-full w-full">
         </div>
      {/if}
      {#if note}
         <section class="mx-auto w-full max-w-2xl">
            <header>
               <Title noteId={note.id} noteTitle={note.title} />
            </header>
         </section>
         <section class="mx-auto w-full max-w-2xl">
            <div class="mb-8 flex flex-col gap-4">
               {#if settingsController.getShowMetadata()}
                  <Metadata noteId={note.id} metadata={note.metadata} />
               {/if}
               <Properties noteId={note.id} properties={note.properties} />
               <ChildNotes children={note.children} />
            </div>
         </section>

         <section>
            <Editor noteId={note.id} content={note.content} />
         </section>
      {:else}
         <header>
            <h1>Create or select a new note</h1>
         </header>
      {/if}
   </article>
</div>
