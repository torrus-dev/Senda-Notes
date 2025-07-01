<script lang="ts">
import type { Note } from "@projectTypes/core/noteTypes";

import Title from "@components/note/Title.svelte";
import Metadata from "@components/note/widgets/Metadata.svelte";
import PropertyList from "@components/note/widgets/PropertyList.svelte";
import ChildNotes from "@components/note/widgets/ChildNotes.svelte";
import Editor from "@components/note/editor/Editor.svelte";
import { settingsController } from "@controllers/application/settingsController.svelte";

let { note }: { note: Note | undefined } = $props();
</script>

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
{/if}
