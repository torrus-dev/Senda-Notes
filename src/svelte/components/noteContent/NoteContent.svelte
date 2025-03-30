<script>
import Title from "./Title.svelte";
import Metadata from "./Metadata.svelte";
import Properties from "@components/properties/Properties.svelte";
import ChildNotes from "./ChildNotes.svelte";
import Editor from "./editor/Editor.svelte";

import { settingsController } from "@controllers/settingsController.svelte";

let { note } = $props();
</script>

<div class="overflow-auto">
   <article class="mx-auto w-full max-w-3xl p-3">
      {#if note}
         <header>
            <Title note={note} />
            {#if settingsController.getShowMetadata()}
               <Metadata noteId={note.id} metadata={note.metadata}></Metadata>
            {/if}
            <Properties note={note} />
            <ChildNotes note={note} />
         </header>
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
