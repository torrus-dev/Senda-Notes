<style>
</style>

<script>
import NoteTreeNode from "./NoteTreeNode.svelte";
import { noteController } from "../../controllers/noteController.svelte";
import { dndController } from "../../controllers/dndController.svelte";
import NoteTreeLine from "./NoteTreeLine.svelte";
import NoteTreeLabel from "./NoteTreeLabel.svelte";
import {
  createNoteTreeNodeDndHandlers,
  isNodeDescendant,
} from "./NoteTreeDnd.svelte";

let { note, position = -1 } = $props();

let isExpanded = $state(true);
let isDragedOver = $state(false);
let isDragged = $derived(
  dndController.dragSource &&
    dndController.dragSource.type === "notetree-note" &&
    dndController.dragSource.id === note.id,
);
let parentIsDragging = $derived.by(() => {
  let dragSourceId = dndController.getDragSourceId();
  if (dragSourceId) {
    return isNodeDescendant(note.id, dragSourceId);
  }
  return false;
});

const toggleExpansion = (event) => {
  event.stopPropagation();
  isExpanded = !isExpanded;
};

// Setup drag and drop
const {
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDragLeave,
  handleDrop: handleNoteDrop,
} = createNoteTreeNodeDndHandlers({
  note,
  setIsDraggedOver: (val) => (isDragedOver = val),
});
</script>

<NoteTreeLine
  id={note.id}
  position={position}
  parentId={note.parentId}
  parentIsDragging={parentIsDragging} />

<li
  class="group/node rounded-field cursor-pointer bg-transparent transition-colors duration-300
    {isDragedOver ? 'highlight' : ''} 
    {isDragged ? 'opacity-50' : ''}"
  draggable="true"
  ondragstart={handleDragStart}
  ondragend={handleDragEnd}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleNoteDrop}>
  <NoteTreeLabel
    note={note}
    position={position}
    toggleExpansion={toggleExpansion}
    isExpanded={isExpanded} />

  {#if isExpanded && note.children && note.children.length > 0}
    <ul class="border-base-400/60 ml-2.5 border-l-2">
      {#each note.children as noteId, index}
        <NoteTreeNode
          note={noteController.getNoteById(noteId)}
          position={index} />
      {/each}
      <NoteTreeLine
        position={note.children.length}
        parentId={note.id}
        parentIsDragging={parentIsDragging} />
    </ul>
  {/if}
</li>
