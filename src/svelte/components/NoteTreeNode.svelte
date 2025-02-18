<script>
  import NoteTreeNode from "./NoteTreeNode.svelte";
  import { noteController } from "../noteController.svelte";
  import { ChevronDownIcon, ChevronRightIcon } from "lucide-svelte";

  let { note, depth = 0 } = $props();

  // Estado de expansión local
  let isExpanded = $state(true);

  // Estados para drag & drop
  let isDragging = $state(false);
  let dropZone = $state(null); // "top", "center", "bottom" o null

  // Determinar si la nota está activa
  const isActive = $derived(note.id === noteController.activeNoteId);

  // Alternar expansión (evita que se propague el evento)
  const toggleExpansion = (event) => {
    event.stopPropagation();
    isExpanded = !isExpanded;
  };

  // Manejar clic en el título (también para teclado)
  const handleTitlePress = (event) => {
    if (event.key === "Enter" || event.type === "click") {
      noteController.setActiveNote(note.id);
      if (note.children.length > 0 && !isExpanded) {
        isExpanded = true;
      }
    }
  };

  /* ----------------- HANDLERS DRAG & DROP ----------------- */

  const handleDragStart = (event) => {
    event.dataTransfer.setData("text/plain", note.id);
    event.dataTransfer.effectAllowed = "move";
    isDragging = true;
    console.log("dragging element: ", { note });
    event.stopPropagation();
  };

  const handleDragEnd = () => {
    isDragging = false;
    dropZone = null;
    console.log("droping element: ", { note });
    event.stopPropagation();
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // Permite el drop
    event.dataTransfer.dropEffect = "move";
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetY = event.clientY - rect.top;
    // Determinar zona de drop según la posición vertical del cursor
    if (offsetY < rect.height * 0.25) {
      dropZone = "top";
    } else if (offsetY > rect.height * 0.75) {
      dropZone = "bottom";
    } else {
      dropZone = "center";
    }
  };

  const handleDragLeave = () => {
    dropZone = null;
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const zone = dropZone;
    dropZone = null;
    const draggedNoteId = event.dataTransfer.getData("text/plain");
    if (!draggedNoteId || draggedNoteId === note.id) return;

    if (zone === "center") {
      // Insertar la nota arrastrada DENTRO de la nota destino
      noteController.moveNote(draggedNoteId, note.id);
    } else if (zone === "top" || zone === "bottom") {
      // Insertar la nota arrastrada COMO hermano del nodo destino
      const parentId = note.parentId || null;
      let siblings = [];
      if (parentId) {
        const parentNote = noteController.getNoteById(parentId);
        siblings = [...parentNote.children];
      } else {
        // Para notas raíz, asumimos que noteController.getRootNotes() devuelve un array de notas
        siblings = noteController.getRootNotes().map((n) => n.id);
      }
      // Eliminamos el id de la nota arrastrada si ya está en la lista
      siblings = siblings.filter((id) => id !== draggedNoteId);
      // Encontramos el índice del nodo destino
      const index = siblings.indexOf(note.id);
      let insertIndex = index;
      if (zone === "bottom") {
        insertIndex = index + 1;
      }
      siblings.splice(insertIndex, 0, draggedNoteId);
      noteController.reorderChildren(parentId, siblings);
    }
  };
</script>

<li
  class="group/node list-none cursor-pointer
         {isDragging ? 'opacity-50' : ''} 
         {dropZone === 'top' ? 'drop-top' : ''} 
         {dropZone === 'bottom' ? 'drop-bottom' : ''} 
         {dropZone === 'center' ? 'bg-accent' : ''}"
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
    onclick={handleTitlePress}
    onkeydown={handleTitlePress}
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
