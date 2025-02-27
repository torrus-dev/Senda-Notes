<script>
import { dndController } from "../../controllers/dndController.svelte";
import { noteController } from "../../controllers/noteController.svelte";
import { ChevronRightIcon } from "lucide-svelte";

let { note, position = -1, depth = 0, toggleExpansion, isExpanded } = $props();

let isActive = $derived(note.id === noteController.activeNoteId);

const handleTitleClick = (event) => {
  if (event.key === "Enter" || event.type === "click") {
    noteController.setActiveNote(note.id);
  }
};

/* ---------- HANDLERS PARA DRAG & DROP SOBRE EL CONTENIDO (child insertion) ---------- */
const handleDragStart = (event) => {
  event.stopPropagation();
  event.dataTransfer.setData("text/plain", note.id);
  event.dataTransfer.effectAllowed = "move";
  workspace.state.dragAndDrop = {
    draggedNoteId: note.id,
    dropTargetId: null,
    position: null,
  };
};

const handleDragEnd = (event) => {
  dndController.clearDragAndDrop();
};

const handleNoteDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  if (workspace.state.dragAndDrop) {
    workspace.state.dragAndDrop.dropTargetId = note.id;
    workspace.state.dragAndDrop.position = "child";
  }
};

const handleNoteDrop = (event) => {
  event.preventDefault();
  event.stopPropagation();
  const dndState = workspace.state.dragAndDrop;
  dndController.clearDragAndDrop();
  if (!dndState) return;
  const { draggedNoteId } = dndState;
  if (!draggedNoteId || draggedNoteId === note.id) return;
  // Insertar como hijo
  noteController.moveNote(draggedNoteId, note.id);
};
</script>

<div
  class="rounded-field ml-1.5 flex gap-1 px-2 py-1.5 pl-1 whitespace-nowrap transition-colors select-none hover:bg-(--color-bg-hover) {isActive
    ? 'bg-(--color-bg-active)'
    : ''}"
  role="button"
  tabindex="0"
  style={`margin-left: calc(var(--spacing) * ${depth})`}
  draggable="true"
  onclick={handleTitleClick}
  onkeydown={handleTitleClick}
  ondragstart={handleDragStart}
  ondragend={handleDragEnd}
  ondragover={handleNoteDragOver}
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
