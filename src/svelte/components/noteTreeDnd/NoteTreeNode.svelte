<style>
.highlight {
  background-color: darkblue;
}
</style>

<script>
import NoteTreeNode from "./NoteTreeNode.svelte";
import { noteController } from "../../controllers/noteController.svelte";
import { dndController } from "../../controllers/dndController.svelte";
import NoteTreeLine from "./NoteTreeLine.svelte";
import NoteTreeLabel from "./NoteTreeLabel.svelte";

let { note, depth = 0, position = -1, parentIsDragging = false } = $props();

let isExpanded = $state(true);
let isDragedOver = $state(false);
let isDragged = $derived(
  dndController.dragSource &&
    dndController.dragSource.type === "notetree-note" &&
    dndController.dragSource.id === note.id,
);

const toggleExpansion = (event) => {
  event.stopPropagation();
  isExpanded = !isExpanded;
};

// handles para drag
const handleDragStart = (event) => {
  event.stopPropagation();
  parentIsDragging = true;
  dndController.setDragStart({
    id: note.id,
    type: "notetree-note",
  });
  event.dataTransfer.effectAllowed = "move";
};

const handleDragEnd = (event) => {
  dndController.clearDragAndDrop();
  parentIsDragging = false;
};

// Handlers para dragover y drop
const handleDragOver = (event) => {
  if (
    dndController.dragSource &&
    dndController.dragSource.id &&
    dndController.dragSource.id !== note.id
  ) {
    event.preventDefault();
    if (!parentIsDragging) {
      isDragedOver = true;
    }
  }
};

const handleDragLeave = (event) => {
  if (
    !parentIsDragging &&
    dndController.dragSource &&
    dndController.dragSource.id &&
    dndController.dragSource.id !== note.id
  ) {
    event.preventDefault();
    if (!parentIsDragging) {
      isDragedOver = false;
    }
  }
};

const handleNoteDrop = (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (!parentIsDragging) {
    isDragedOver = false;
  }
  console.log(isDragedOver);
  console.log("droping on Note");
};
</script>

<NoteTreeLine
  position={position}
  depth={depth}
  parentId={note.parentId}
  bind:parentIsDragging={parentIsDragging} />

<li
  class="group/node rounded-field cursor-pointer
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
    depth={depth}
    toggleExpansion={toggleExpansion}
    isExpanded={isExpanded} />

  {#if isExpanded && note.children.length > 0}
    <ul class="ml-3">
      {#each note.children as noteId, index}
        <NoteTreeNode
          note={noteController.getNoteById(noteId)}
          position={index}
          depth={depth + 1}
          bind:parentIsDragging={parentIsDragging} />
      {/each}
      <NoteTreeLine
        position={note.children.length}
        depth={depth + 1}
        parentId={note.id}
        bind:parentIsDragging={parentIsDragging} />
    </ul>
  {/if}
</li>
