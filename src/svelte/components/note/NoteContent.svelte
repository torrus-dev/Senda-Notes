<script lang="ts">
import type { Note } from "@projectTypes/core/noteTypes";

import { settingsController } from "@controllers/application/settingsController.svelte";
import { searchController } from "@controllers/navigation/searchController.svelte";

import Title from "@components/note/Title.svelte";
import Metadata from "@components/note/widgets/Metadata.svelte";
import PropertyList from "@components/note/widgets/PropertyList.svelte";
import ChildNotes from "@components/note/widgets/ChildNotes.svelte";
import Editor from "@components/note/editor/Editor.svelte";
import HomePanel from "./HomePanel.svelte";

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
               {#if settingsController.showMetadata}
                  <Metadata noteId={note.id} metadata={note.metadata} />
               {/if}
               <PropertyList noteId={note.id} />
               <ChildNotes children={note.children} />
            </div>
         </section>

         <section>
            <Editor noteId={note.id} content={note.content} />
         </section>
      {:else}
         <HomePanel/>
      {/if}
   </article>
</div>
