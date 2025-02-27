import { noteController } from "./noteController.svelte";

// Define los tipos específicos para el DnD
export type DragSource = {
  id: string;
  type: "note" | "tab" | "other";
  data: any;
};

export type DropTarget = {
  type: "notetree-note" | "notetree-line" | "tab-area" | "other";
  data: any;
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

  handleDrop = () => {
    if (this.dragSource && this.dropTarget && this.dragSource.type === "note") {
      if (this.dropTarget.type === "notetree-note") {
        this.dropNoteOnNote();
      } else if (this.dropTarget.type === "notetree-line") {
        this.dropNoteOnLineIndicator();
      }
    }
  };

  dropNoteOnNote = () => {};

  dropNoteOnLineIndicator = (
    parentId: string | null = null,
    draggedNoteId: string | null = null,
    position: number = -1,
  ) => {
    if (!draggedNoteId || position === -1) return;

    noteController.moveNoteToPosition(draggedNoteId, parentId, position)

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
