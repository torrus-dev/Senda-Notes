<style>
/* Wrapper que aumenta el área de drop sin modificar el aspecto visual de la línea */

.isExpanded div {
  transform: rotate(90deg);
}
</style>

<script>
import NoteTreeNode from "./NoteTreeNode.svelte";
import { noteController } from "../../controllers/noteController.svelte";
import { workspace } from "../../controllers/workspaceController.svelte";
import NoteTreeLine from "./NoteTreeLine.svelte";
import NoteTreeLabel from "./NoteTreeLabel.svelte";

const { note, depth = 0, position = -1 } = $props();

let isExpanded = $state(true);
let isDragged = $derived.by(
  () => workspace.state.dragAndDrop?.draggedNoteId === note.id,
);

const toggleExpansion = (event) => {
  event.stopPropagation();
  isExpanded = !isExpanded;
};
</script>

<li class="group/node cursor-pointer list-none {isDragged ? 'opacity-50' : ''}">
  <NoteTreeLine position={position} depth={depth} parentId={note.parentId} />

  <NoteTreeLabel
    note={note}
    position={position}
    depth={depth}
    toggleExpansion={toggleExpansion}
    isExpanded={isExpanded} />

  {#if isExpanded && note.children.length > 0}
    <ul class="ml-3">
      {#each note.children as noteId, index}
        <NoteTreeNode
          note={noteController.getNoteById(noteId)}
          position={index}
          depth={depth + 1} />
      {/each}
      <NoteTreeLine
        position={note.children.length}
        depth={depth + 1}
        parentId={note.id} />
    </ul>
  {/if}
</li>
