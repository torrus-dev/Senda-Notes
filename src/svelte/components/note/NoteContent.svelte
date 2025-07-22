<script lang="ts">
import type { Note } from "@projectTypes/core/noteTypes";
import type { Tab } from "@projectTypes/ui/uiTypes";

import { settingsController } from "@controllers/application/SettingsController.svelte";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";

import Metadata from "@components/note/widgets/Metadata.svelte";
import PropertyList from "@components/note/widgets/Properties.svelte";
import ChildNotes from "@components/note/widgets/ChildNotes.svelte";
import Editor from "@components/note/editor/Editor.svelte";
import NoteTitleEditor from "@components/note/widgets/NoteTitleEditor.svelte";

let { tab }: { tab: Tab } = $props();
let note: Note | undefined = $derived(
   tab?.noteReference?.noteId
      ? noteQueryController.getNoteById(tab.noteReference.noteId)
      : undefined,
);
</script>

{#if note}
   <section class="mx-auto w-full max-w-2xl">
      <header>
         <NoteTitleEditor
            noteId={note.id}
            noteTitle={note.title}
            autoEditOnClick={true}
            id="{tab.id}-noteTitle"
            class="overflow-h mt-16 mb-3 text-4xl font-bold" />
      </header>
   </section>
   <section class="mx-auto w-full max-w-2xl">
      <div class="mb-8 flex flex-col gap-4">
         {#if settingsController.get("showMetadata") && note.metadata}
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
