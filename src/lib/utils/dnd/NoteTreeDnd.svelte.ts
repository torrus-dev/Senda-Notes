import { isDescendant } from "../noteUtils";
import { dndController } from "../../../controllers/dndController.svelte";
import { noteController } from "../../../controllers/noteController.svelte";

// Handlers para NoteTreeNode
export function createNoteTreeNodeDndHandlers(params: {
  noteId: string;
  parentId?: string;
  children?: string[];
  notePosition: number;
  setIsDraggedOver: (val: boolean) => void;
}) {
  const { noteId, parentId, children, notePosition, setIsDraggedOver } = params;

  const isParentDragging = $derived.by(() => {
    let dragSourceId = dndController.getDragSourceId();
    if (dragSourceId) {
      return isDescendant(noteController.notes, noteId, dragSourceId);
    }
    return false;
  });

  const handleDragStart = (event: DragEvent) => {
    event.stopPropagation();
    dndController.setDragSource({
      id: noteId,
      type: "notetree-note",
      position: notePosition,
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
    if (dragSourceId && dragSourceId !== noteId) {
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
    if (isParentDragging || !dragSourceId || dragSourceId === noteId) {
      event.preventDefault();
      event.stopPropagation();
      setIsDraggedOver(false);
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    dndController.setDropTarget({
      id: noteId,
      position: notePosition,
      type: "notetree-note",
      data: {
        parentId: parentId,
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
  linePosition: number;
  parentId: string | null;
  setIsDraggedOver: (val: boolean) => void;
}) {
  const { id, linePosition, parentId, setIsDraggedOver } = params;

  const isParentDragging = $derived.by(() => {
    let dragSourceId = dndController.getDragSourceId();
    if (dragSourceId) {
      return isDescendant(noteController.notes, id, dragSourceId);
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
      position: linePosition,
      data: {
        parentId: parentId,
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
  return isDescendant(noteController.notes, noteId, potentialAncestorId);
}
