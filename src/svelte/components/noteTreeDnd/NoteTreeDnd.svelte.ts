import { dndController } from "../../../controllers/dndController.svelte";
import { noteController } from "../../../controllers/noteController.svelte";

// Handlers para NoteTreeNode
export function createNoteTreeNodeDndHandlers(params: {
  note: { id: string; parentId?: string; children?: string[] };
  setIsDraggedOver: (val: boolean) => void;
}) {
  const { note, setIsDraggedOver } = params;

  const isParentDragging = $derived.by(() => {
    let dragSourceId = dndController.getDragSourceId();
    if (dragSourceId) {
      return noteController.isDescendant(note.id, dragSourceId);
    }
    return false;
  });

  const handleDragStart = (event: DragEvent) => {
    event.stopPropagation();
    dndController.setDragSource({
      id: note.id,
      type: "notetree-note",
    });
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragEnd = (_event: DragEvent) => {
    dndController.clearDragAndDrop();
  };

  const handleDragOver = (event: DragEvent) => {
    let dragSourceId = dndController.getDragSourceId();

    // Si hay un dragSourceId y este nodo o alguno de sus ancestros es el que se está arrastrando,
    // no permitimos el drop (evitamos circular references)
    if (isParentDragging) {
      event.stopPropagation();
      return;
    }

    event.stopPropagation();
    if (dragSourceId && dragSourceId !== note.id) {
      event.preventDefault();
      setIsDraggedOver(true);
    }
  };

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    setIsDraggedOver(false);
  };

  const handleDrop = (event: DragEvent) => {
    let dragSourceId = dndController.getDragSourceId();

    // Verificación adicional para evitar drop en nodos hijos
    if (isParentDragging || !dragSourceId || dragSourceId === note.id) {
      event.preventDefault();
      event.stopPropagation();
      setIsDraggedOver(false);
      return;
    }

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
    setIsDraggedOver(false);
  };

  return {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}

// Handlers para NoteTreeLine
export function createNoteTreeLineDndHandlers(params: {
  id: string;
  position: number;
  parentId: string | null;
  setIsDraggedOver: (val: boolean) => void;
}) {
  const { id, position, parentId, setIsDraggedOver } = params;

  const isParentDragging = $derived.by(() => {
    let dragSourceId = dndController.getDragSourceId();
    if (dragSourceId) {
      return noteController.isDescendant(id, dragSourceId);
    }
    return false;
  });

  const handleDragOver = (event: DragEvent) => {
    // Si el padre está siendo arrastrado o es descendiente del elemento arrastrado,
    // no permitimos el dragover
    if (isParentDragging) {
      event.stopPropagation();
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setIsDraggedOver(true);
  };

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    setIsDraggedOver(false);
  };

  const handleDrop = (event: DragEvent) => {
    // Si el padre está siendo arrastrado, cancelamos el drop
    if (isParentDragging) {
      event.preventDefault();
      event.stopPropagation();
      setIsDraggedOver(false);
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setIsDraggedOver(false);

    dndController.setDropTarget({
      type: "notetree-line",
      data: {
        parentId: parentId,
        position: position,
      },
    });
    dndController.handleDrop();
  };

  return {
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}

// Función auxiliar para verificar si un nodo es descendiente
export function isNodeDescendant(
  noteId: string,
  potentialAncestorId: string,
): boolean {
  return noteController.isDescendant(noteId, potentialAncestorId);
}
