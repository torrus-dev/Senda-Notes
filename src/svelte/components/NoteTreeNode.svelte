<style>
.isExpanded span {
  transform: rotate(90deg);
}
.drop-top {
  border-top: inset 2px var(--color-accent);
}
.drop-bottom {
  border-bottom: inset 2px var(--color-accent);
}
.drop-center {
  background-color: var(--color-accent);
}
</style>

<script>
import NoteTreeNode from "./NoteTreeNode.svelte";
import { noteController } from "../noteController.svelte";
import { workspace } from "../workspaceController.svelte";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-svelte"; // hacer una clase css con transform rotate y dejar solo un icono

let { note, depth = 0 } = $props();

// Estado local para expansión
let isExpanded = $state(true);

// Estado derivado: indica si este nodo es el que se está arrastrando
let isDragged = $derived.by(() => {
  workspace.state.dragAndDrop?.draggedNoteId === note.id;
});

// Estado derivado: indica si este nodo es el drop target y en qué posición
let dropZone = $derived.by(() => {
  if (
    workspace.state.dragAndDrop &&
    workspace.state.dragAndDrop.dropTargetId === note.id
  ) {
    return workspace.state.dragAndDrop.position;
  }
  return null;
});

// Estado derivado: si la nota es la activa
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

/* -------------------- HANDLERS DRAG & DROP -------------------- */

const handleDragStart = (event) => {
  event.stopPropagation(); // Añadido para evitar burbujeo
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

const handleDragOver = (event) => {
  event.preventDefault();
  const draggedNoteId = workspace.state.dragAndDrop?.draggedNoteId;

  // Prevenir interacción consigo mismo
  if (draggedNoteId === note.id) return;

  event.dataTransfer.dropEffect = "move";
  const rect = event.currentTarget.getBoundingClientRect();
  const offsetY = event.clientY - rect.top;

  // Ajustar thresholds
  let position = null;
  if (offsetY < rect.height * 0.3) {
    position = "top";
  } else if (offsetY > rect.height * 0.7) {
    position = "bottom";
  } else {
    position = "center";
  }

  if (workspace.state.dragAndDrop) {
    workspace.state.dragAndDrop.dropTargetId = note.id;
    workspace.state.dragAndDrop.position = position;
  }
};

const handleDragLeave = (event) => {
  // Verificar que el cursor salga completamente del elemento
  const rect = event.currentTarget.getBoundingClientRect();
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  ) {
    if (workspace.state.dragAndDrop?.dropTargetId === note.id) {
      workspace.state.dragAndDrop.dropTargetId = null;
      workspace.state.dragAndDrop.position = null;
    }
  }
};

const handleDrop = (event) => {
  event.preventDefault();
  event.stopPropagation();
  const dndState = workspace.state.dragAndDrop;
  workspace.clearDragAndDrop();

  if (!dndState) return;
  const { draggedNoteId, position } = dndState;

  if (!draggedNoteId || draggedNoteId === note.id) return;

  if (position === "center") {
    // Insertar DENTRO del nodo destino
    noteController.moveNote(draggedNoteId, note.id);
  } else if (position === "top" || position === "bottom") {
    // Insertar como hermano del nodo destino
    const parentId = note.parentId || null; // Usar null explícito para raíz

    // 1. Mover la nota al nuevo padre
    noteController.moveNote(draggedNoteId, parentId);

    // 2. Obtener hermanos actualizados
    let siblings = parentId
      ? noteController.getNoteById(parentId)?.children || []
      : noteController.getRootNotes().map((n) => n.id);

    // 3. Filtrar y ordenar
    siblings = siblings.filter((id) => id !== draggedNoteId);
    const index = siblings.indexOf(note.id);
    const insertIndex = position === "bottom" ? index + 1 : index;

    // 4. Insertar y reordenar
    siblings.splice(insertIndex, 0, draggedNoteId);

    // Llamada corregida con parentId potencialmente null
    noteController.reorderNotes(parentId, siblings);
  }
};
</script>

<li class="group/node cursor-pointer list-none {isDragged ? 'opacity-50' : ''}">
  <div
    class="rounded-field ml-1.5 flex gap-2 py-1.5 transition-colors select-none hover:bg-(--color-bg-hover)
           {isActive ? 'bg-(--color-bg-active)' : ''}
           {dropZone === 'top' ? 'drop-top' : ''} 
           {dropZone === 'bottom' ? 'drop-bottom' : ''} 
           {dropZone === 'center' ? 'drop-center' : ''}"
    role="button"
    tabindex="0"
    style={`margin-left: ${depth * 0.25}rem`}
    draggable="true"
    onclick={handleTitleClick}
    onkeydown={handleTitleClick}
    ondragstart={handleDragStart}
    ondragend={handleDragEnd}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}>
    {#if note.children && note.children.length > 0}
      <button
        class="transition-color rounded-selector ml-[-0.25rem] inline-flex cursor-pointer items-center p-0.5 whitespace-nowrap duration-200 ease-in-out hover:bg-(--color-bg-hover) {isExpanded
          ? 'isExpanded'
          : ''}"
        onclick={toggleExpansion}
        aria-expanded={isExpanded ? "true" : "false"}
        aria-label={isExpanded ? "Colapsar" : "Expandir"}>
        <span class="transition duration-200">
          <ChevronRightIcon size="16" aria-hidden="true" />
        </span>
      </button>
    {/if}
    <span class="truncate">{note.title}</span>
  </div>

  {#if isExpanded && note.children.length > 0}
    <ul class="space-y-1">
      {#each note.children as noteId}
        <NoteTreeNode
          note={noteController.getNoteById(noteId)}
          depth={depth + 1} />
      {/each}
    </ul>
  {/if}
</li>
