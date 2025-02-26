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
import { ChevronRightIcon } from "lucide-svelte";
import DropLineIndicator from "./DropLineIndicator.svelte";

const { note, depth = 0 } = $props();

let isExpanded = $state(true);
let isDragged = $derived.by(
  () => workspace.state.dragAndDrop?.draggedNoteId === note.id,
);
let isActive = $derived(note.id === noteController.activeNoteId);

const toggleExpansion = (event) => {
  event.stopPropagation();
  isExpanded = !isExpanded;
};

const handleTitleClick = (event) => {
  if (event.key === "Enter" || event.type === "click") {
    noteController.setActiveNote(note.id);
    if (note.children.length > 0 && !isExpanded) {
      isExpanded = true;
    }
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
  workspace.clearDragAndDrop();
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
  workspace.clearDragAndDrop();
  if (!dndState) return;
  const { draggedNoteId } = dndState;
  if (!draggedNoteId || draggedNoteId === note.id) return;
  // Insertar como hijo
  noteController.moveNote(draggedNoteId, note.id);
};

/* ---------- HANDLERS PARA LA DROP ZONE (inserción de hermanos) ---------- */
</script>

<li class="group/node cursor-pointer list-none {isDragged ? 'opacity-50' : ''}">
  <DropLineIndicator />

  <!-- Contenido de la nota: al soltar sobre él se insertará como hijo -->
  <div
    class="note-content rounded-field ml-1.5 flex gap-1 px-2 py-1.5 pl-1 whitespace-nowrap transition-colors select-none hover:bg-(--color-bg-hover) {isActive
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

  {#if isExpanded && note.children.length > 0}
    <ul class="ml-3">
      {#each note.children as noteId, index}
        <!-- Se pasa isFirst para que solo el primero no renderice drop zone superior -->
        <NoteTreeNode
          note={noteController.getNoteById(noteId)}
          depth={depth + 1}
          isFirst={index === 0} />
      {/each}
      <DropLineIndicator />
    </ul>
  {/if}
</li>
