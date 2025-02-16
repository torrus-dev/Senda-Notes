<script>
  import { noteController } from "../noteController.svelte";
  import { SquarePlus } from "lucide-svelte";

  let notes = $derived(noteController.notes);
  let activeNoteId = $derived(noteController.activeNoteId);
</script>

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
      <button
        class:menu-active={note.id === activeNoteId}
        onclick={(e) => {
          e.preventDefault();
          noteController.setActiveNote(noteId);
        }}
      >
        {note.title}
      </button>
    </li>
  {/each}
</ul>
