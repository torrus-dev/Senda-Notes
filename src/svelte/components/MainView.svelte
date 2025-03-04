<script>
import Title from "../components/Title.svelte";
import Editor from "./Editor.svelte";
import Properties from "./properties/Properties.svelte";
import DropdownList from "./utils/DropdownList.svelte";
import { noteController } from "../controllers/noteController.svelte";
import { MoreVerticalIcon, Trash2Icon } from "lucide-svelte";
import Breadcrumbs from "./utils/Breadcrumbs.svelte";
import ChildNotes from "./ChildNotes.svelte";
import Modal from "./layout/Modal.svelte";

const activeNote = $derived(noteController.getActiveNote());
</script>

<main class="overflow-auto">
  <Modal />
  {#if activeNote}
    <div
      class="border-border-normal flex min-h-16 w-full items-center border-b-2 px-8 py-2 shadow-sm">
      <div class="flex-1">
        <Breadcrumbs note={activeNote}></Breadcrumbs>
      </div>

      <DropdownList
        position="end"
        labelClass="outlined"
        menuItems={[
          {
            label: "Delete Note",
            icon: Trash2Icon,
            onClick: () => noteController.deleteNote(activeNote.id),
            class: "text-error",
          },
        ]}>
        {#snippet label()}
          <MoreVerticalIcon size="20" />
        {/snippet}
      </DropdownList>
    </div>

    <article class="mx-auto w-3xl p-3">
      <header>
        <Title id={activeNote.id} />
        <Properties note={activeNote} />
        <ChildNotes note={activeNote} />
      </header>
      <Editor noteId={activeNote.id} />
    </article>
  {:else}
    <article class="mx-auto w-3xl p-3">
      <header>
        <h1>Create or select a new note</h1>
      </header>
    </article>
  {/if}
</main>
