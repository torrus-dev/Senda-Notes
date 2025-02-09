<script>
  import { noteController } from "../noteController.svelte";
  import Button from "./Button.svelte";
  import TrashIcon from "../icons/TrashIcon.svelte";
  import NoteIcon from "../icons/NoteIcon.svelte";

  function handleNoteAction(action, noteId) {
    if (action === "delete") {
      noteController.deleteNote(noteId);
    } else {
      noteController.setActiveNote(noteId);
    }
  }

  let notes = $derived(noteController.notes);
  let activeNoteId = $derived(noteController.activeNoteId);
</script>

<aside class="bg-(--color-bg-secondary)">
  <header class="px-3 py-3 my-6">
    <h2 class="text-2xl font-bold mb-4">Notes:</h2>

    <Button variant="lime" onclick={noteController.createNote}
      ><NoteIcon size="medium" /> New Note</Button
    >
  </header>
  <ul>
    {#each notes as note (note.id)}
      <li
        class="flex group px-3 hover:bg-(--color-interactive-hover) text-(--color-font-muted)"
        class:active={note.id === activeNoteId}
      >
        <button
          class="text-left grow-1 py-1 hover:cursor-pointer"
          onclick={() => handleNoteAction("select", note.id)}
        >
          {note.title}
        </button>
        <button
          class="grow-0 py-1 hover:cursor-pointer opacity-0 group-hover:opacity-100"
          onclick={() => handleNoteAction("delete", note.id)}
        >
          <TrashIcon size="medium" />
        </button>
      </li>
    {/each}
  </ul>
</aside>

<style>
  .active {
    background-color: var(--color-interactive-active);
    color: var(--color-font-normal);
  }
</style>
