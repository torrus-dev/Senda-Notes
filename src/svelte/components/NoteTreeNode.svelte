<script>
  import NoteTreeNode from "./NoteTreeNode.svelte";
  import { noteController } from "../noteController.svelte";
  import { workspace } from "../workspaceController.svelte";
  import { ChevronDownIcon, ChevronRightIcon } from "lucide-svelte";
  // hacer una clase css con transform rotate y dejar solo un icono

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
    event.dataTransfer.dropEffect = "move";
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetY = event.clientY - rect.top;
    let position = null;
    // Ajustar thresholds
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
    if (
      workspace.state.dragAndDrop &&
      workspace.state.dragAndDrop.dropTargetId === note.id
    ) {
      workspace.state.dragAndDrop.dropTargetId = null;
      workspace.state.dragAndDrop.position = null;
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
      const parentId = note.parentId || null;

      // 1. Mover la nota al nuevo padre (actualiza parentId y maneja padres anteriores)
      noteController.moveNote(draggedNoteId, parentId);

      // 2. Obtener lista actualizada de hermanos
      let siblings = [];
      if (parentId) {
        const parentNote = noteController.getNoteById(parentId);
        siblings = [...parentNote.children];
      } else {
        siblings = noteController.getRootNotes().map((n) => n.id);
      }

      // 3. Filtrar la nota arrastrada para evitar duplicados antes de insertar
      siblings = siblings.filter((id) => id !== draggedNoteId);
      const index = siblings.indexOf(note.id);
      let insertIndex = index;
      if (position === "bottom") {
        insertIndex = index + 1;
      }

      // 4. Insertar en la posición correcta y reordenar
      siblings.splice(insertIndex, 0, draggedNoteId);
      noteController.reorderChildren(parentId, siblings);
    }
  };
</script>

<li
  class="group/node list-none cursor-pointer
         {isDragged ? 'opacity-50' : ''} 
         {dropZone === 'top' ? 'drop-top' : ''} 
         {dropZone === 'bottom' ? 'drop-bottom' : ''} 
         {dropZone === 'center' ? 'drop-center' : ''}
        "
  draggable="true"
  ondragstart={handleDragStart}
  ondragend={handleDragEnd}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
>
  <div
    class="flex ml-1.5 py-1 rounded-field select-none transition-colors hover:bg-(--color-neutral) {isActive
      ? 'bg-(--color-neutral)'
      : ''}"
    role="button"
    tabindex="0"
    style={`margin-left: ${depth * 0.25}rem`}
    onclick={handleTitleClick}
    onkeydown={handleTitleClick}
  >
    {#if note.children.length > 0}
      <button
        class="p-1 hover:bg-(--color-neutral) rounded-field transition-colors"
        onclick={toggleExpansion}
        aria-expanded={isExpanded ? "true" : "false"}
        aria-label={isExpanded ? "Colapsar" : "Expandir"}
      >
        {#if isExpanded}
          <ChevronDownIcon size="18" aria-hidden="true" />
        {:else}
          <ChevronRightIcon size="18" aria-hidden="true" />
        {/if}
      </button>
    {/if}
    <span class="truncate">{note.title}</span>
  </div>

  {#if isExpanded && note.children.length > 0}
    <ul class="space-y-1">
      {#each note.children as noteId}
        <NoteTreeNode
          note={noteController.getNoteById(noteId)}
          depth={depth + 1}
        />
      {/each}
    </ul>
  {/if}
</li>
