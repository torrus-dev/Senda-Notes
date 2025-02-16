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

<aside class="bg-base-200 flex-col gap-2">
  <ul class="menu rounded-box w-full p-2">
    <li class="menu-title">Notes</li>
    <li>
      <button
        class="btn mb-4 btn-success"
        onclick={() => {
          noteController.createNote();
        }}
      >
        <SquarePlus size="18" /> New Note
      </button>
    </li>
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
