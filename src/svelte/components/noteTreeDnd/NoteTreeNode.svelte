<style>
</style>

<script>
import NoteTreeNode from "./NoteTreeNode.svelte";
import { noteController } from "../../controllers/noteController.svelte";
import { dndController } from "../../controllers/dndController.svelte";
import NoteTreeLine from "./NoteTreeLine.svelte";
import NoteTreeLabel from "./NoteTreeLabel.svelte";

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
    return noteController.isDescendant(note.id, dragSourceId);
  }
  return false;
});

const toggleExpansion = (event) => {
  event.stopPropagation();
  isExpanded = !isExpanded;
};

// handles para drag
const handleDragStart = (event) => {
  event.stopPropagation();
  dndController.setDragSource({
    id: note.id,
    type: "notetree-note",
  });
  event.dataTransfer.effectAllowed = "move";
};

const handleDragEnd = (event) => {
  dndController.clearDragAndDrop();
};

// Handlers para dragover y drop
const handleDragOver = (event) => {
  let dragSourceId = dndController.getDragSourceId();
  if (!parentIsDragging) {
    event.stopPropagation();
    if (dragSourceId && dragSourceId !== note.id) {
      event.preventDefault();
      isDragedOver = true;
    }
  }
};

const handleDragLeave = (event) => {
  let dragSourceId = dndController.getDragSourceId();
  if (!parentIsDragging && dragSourceId && dragSourceId !== note.id) {
    event.preventDefault();
    isDragedOver = false;
  }
};

const handleNoteDrop = (event) => {
  event.preventDefault();
  event.stopPropagation();
  dndController.setDropTarget({
    id: note.id,
    type: "notetree-note",
    data: {
      parentId: note.parentId,
    },
  });
  dndController.handleDrop();
  isDragedOver = false;
};
</script>

<NoteTreeLine
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
    <ul class="border-base-400/50 ml-2.5 border-l-2">
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
