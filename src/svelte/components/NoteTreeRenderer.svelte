<script>
  import { noteController } from "../noteController.svelte";
  import NoteTreeNode from "./NoteTreeNode.svelte";

  let notes = $derived(noteController.notes);
  const rootNotes = $derived.by(() =>
    notes
      .filter((n) => !n.parentId)
      .sort((a, b) => a.title.localeCompare(b.title)),
  );
</script>

<ul class="menu rounded-box w-full p-2">
  <li class="menu-title">Notes</li>
  {#each rootNotes as note (note.id)}
    <NoteTreeNode {note} depth={0} />
  {/each}
</ul>
