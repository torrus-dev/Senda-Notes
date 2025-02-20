<script>
  import { noteController } from "../noteController.svelte";
  import NoteTreeNode from "./NoteTreeNode.svelte";
  import { PlusIcon } from "lucide-svelte";

  let rootNotes = $derived(noteController.getRootNotes());
</script>

<ul class="menu rounded-box w-full p-2">
  <li class="group menu-title flex flex-row justify-between">
    <p>Notes</p>
    <button
      class="btn btn-xs mb-4 btn-success inline-flex w-auto opacity-0 group-hover:opacity-100"
      onclick={() => noteController.createNote()}
    >
      <PlusIcon size="18"></PlusIcon>
    </button>
  </li>
  {#if rootNotes.length > 0}
    {#each rootNotes as note (note.id)}
      <NoteTreeNode {note} depth={0} />
    {/each}
  {/if}
</ul>
