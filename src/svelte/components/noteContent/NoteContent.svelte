<script lang="ts">
import Title from "./Title.svelte";
import Metadata from "./Metadata.svelte";
import Properties from "@components/properties/Properties.svelte";
import ChildNotes from "./ChildNotes.svelte";
import Editor from "./editor/Editor.svelte";

import { settingsController } from "@controllers/settingsController.svelte";
import type { Note } from "@projectTypes/noteTypes";

let { note }: { note: Note } = $props();
</script>

<div class="overflow-auto">
   <article class="mx-auto w-full max-w-3xl p-3">
      {#if note}
         <header>
            <Title note={note} />
         </header>
         <section class="mb-8 flex flex-col gap-4">
            {#if settingsController.getShowMetadata()}
               <Metadata noteId={note.id} metadata={note.metadata}></Metadata>
            {/if}
            <Properties noteId={note.id} properties={note.properties} />
            <ChildNotes children={note.children} />
         </section>

         <section>
            <Editor noteId={note.id} />
         </section>
      {:else}
         <header>
            <h1>Create or select a new note</h1>
         </header>
      {/if}
   </article>
</div>
