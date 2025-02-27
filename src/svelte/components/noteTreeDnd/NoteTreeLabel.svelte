<style>
.highlight {
  background-color: darkblue;
}

.isExpanded div {
  transform: rotate(90deg);
}
</style>

<script>
import { dndController } from "../../controllers/dndController.svelte";
import { noteController } from "../../controllers/noteController.svelte";
import { workspace } from "../../controllers/workspaceController.svelte";
import { ChevronRightIcon } from "lucide-svelte";

let { note, position = -1, depth = 0, toggleExpansion, isExpanded } = $props();

let isDragged = $derived(
  dndController.dragSource &&
    dndController.dragSource.type === "notetree-note" &&
    dndController.dragSource.id === note.id,
);
let isActive = $derived(note.id === noteController.activeNoteId);
let isDragedOver = $state(false);

const handleSelectTitle = (event) => {
  if (event.key === "Enter" || event.type === "click") {
    noteController.setActiveNote(note.id);
  }
};

// handles para drag
const handleDragStart = (event) => {
  console.log("drag start");
  event.stopPropagation();
  dndController.setDragStart({
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
  if (
    dndController.dragSource &&
    dndController.dragSource.id &&
    dndController.dragSource.id !== note.id
  ) {
    event.preventDefault();
    isDragedOver = true;
  }
};

const handleDragLeave = (event) => {
  event.preventDefault();
  isDragedOver = false;
};

const handleNoteDrop = (event) => {
  event.preventDefault();
  event.stopPropagation();
  console.log("drop on note");
};
</script>

<div
  class="rounded-field ml-1.5 flex gap-1 px-2 py-1.5 pl-1 whitespace-nowrap transition-colors select-none hover:bg-(--color-bg-hover) {isActive
    ? 'bg-(--color-bg-active)'
    : ''} {isDragged ? 'opacity-50' : ''} {isDragedOver ? 'highlight' : ''}"
  role="button"
  tabindex="0"
  style={`margin-left: calc(var(--spacing) * ${depth})`}
  draggable="true"
  onclick={handleSelectTitle}
  onkeydown={handleSelectTitle}
  ondragstart={handleDragStart}
  ondragend={handleDragEnd}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleNoteDrop}>
  {#if note.children && note.children.length > 0}
    <button
      class="transition-color rounded-selector cursor-pointer items-center whitespace-nowrap duration-200 ease-in-out hover:bg-(--color-bg-hover) {isExpanded
        ? 'isExpanded'
        : ''}"
      onclick={toggleExpansion}
      aria-expanded={isExpanded ? "true" : "false"}
      aria-label={isExpanded ? "Colapsar" : "Expandir"}>
      <div class="transition duration-200">
        <ChevronRightIcon size="16" aria-hidden="true" />
      </div>
    </button>
  {:else}
    <span class="w-4"></span>
  {/if}
  <span class="truncate">{note.title}</span>
</div>
