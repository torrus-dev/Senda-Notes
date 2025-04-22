<script lang="ts">
import Title from "./Title.svelte";
import Metadata from "./Metadata.svelte";
import Properties from "@components/noteView/properties/Properties.svelte";
import ChildNotes from "./ChildNotes.svelte";
import Editor from "./editor/Editor.svelte";

import { settingsController } from "@controllers/settingsController.svelte";
import type { Note } from "@projectTypes/noteTypes";
import { searchController } from "@controllers/searchController.svelte";

let { note }: { note: Note | undefined } = $props();
</script>

<div
   class="scroll h-full overflow-auto
   {searchController.isSearching ? 'overflow-hidden' : ''}">
   <article class="relative h-full py-4">
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
         <section class="flex h-full w-full content-center">
            <div class="m-auto text-center">
               <header class="">
                  <h1 class="my-4 text-center text-xl">No note is open</h1>
               </header>
               <ul>
                  <li>Create new note</li>
                  <li>Search note</li>
               </ul>
            </div>
         </section>
      {/if}
   </article>
</div>
