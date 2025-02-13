<script>
  import { noteController } from "../noteController.svelte";
  import { SquarePlus, Trash2 } from "lucide-svelte";

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

<aside class="bg-(--color-bg-secondary) p-4 flex-col gap-2">
  <button class="btn btn-success" onclick={noteController.createNote}>
    <SquarePlus size="18" /> New Note
  </button>
  <ul class="menu bg-base-100 rounded-box w-full p-2">
    <li class="menu-title">Notes</li>
    {#each notes as note (note.id)}
      <li>
        <a
          href="#note-{note.id}"
          class:menu-active={note.id === activeNoteId}
          onclick={(e) => {
            e.preventDefault();
            handleNoteAction("select", note.id);
          }}
        >
          {note.title}
        </a>
      </li>
    {/each}
    {#if false}
      <button
        class="grow-0 py-1 hover:cursor-pointer opacity-0 group-hover:opacity-100"
        onclick={() => handleNoteAction("delete", note.id)}
      >
        <Trash2 size="18" />
      </button>
    {/if}
  </ul>
</aside>

<style>
</style>
