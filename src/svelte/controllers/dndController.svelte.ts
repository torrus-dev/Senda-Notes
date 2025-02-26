// Define los tipos específicos para el DnD
export type DragSource = {
  id: string;
  type: "note" | "tab" | "other";
  data: any;
};

export type DropTarget = {
  type: "note" | "note-between" | "folder" | "tab-area" | "other";
  position?: "before" | "after" | "inside";
};

class DndController {
  // Estado global del workspace (incluye propertyEditor, ventanas y pestañas)
  isDragging = $state<boolean>(false);
  dragSource = $state<DragSource | undefined>(undefined);
  dropTarget = $state<DropTarget | undefined>(undefined);

  clearDragAndDrop = () => {
    this.isDragging = false;
    this.dragSource = undefined;
    this.dropTarget = undefined;
  };

  dragStart = (dragSource: DragSource) => {
    this.dragSource = dragSource;
  };

  setDropTarget = (dropTarget: DropTarget) => {
    this.dropTarget = dropTarget;
  };

  dropNoteOnLineIndicator = (parentId = null, position = -1) => {
    // comprovaciones de estado en WorkspaceController
    if (!dndState) return;
    const { draggedNoteId } = dndState;
    if (!draggedNoteId || draggedNoteId === note.id) return;

    noteController.moveNote(draggedNoteId, parentId);

    let siblings = parentId
      ? noteController.getNoteById(parentId)?.children || []
      : noteController.getRootNotes().map((n) => n.id);
    siblings = siblings.filter((id) => id !== draggedNoteId);
    const index = siblings.indexOf(note.id);
    siblings.splice(index, 0, draggedNoteId);
    noteController.reorderNotes(parentId, siblings);
  };
}
export const dndController = $state(new DndController());
