<script>
  import { noteController } from "../noteController.svelte";
  import NoteTreeNode from "./NoteTreeNode.svelte";

  let rootNotes = $derived(noteController.getRootNotes());
</script>

<ul class="menu rounded-box w-full p-2">
  <li class="menu-title">Notes</li>
  {#each rootNotes as note (note.id)}
    <NoteTreeNode {note} depth={0} />
  {/each}
</ul>
