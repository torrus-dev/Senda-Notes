import { noteController } from "./noteController.svelte";

// Define los tipos específicos para el DnD
export type DragSource = {
  id: string;
  type: "note" | "tab" | "other";
  data: any;
};

export type DropTarget = {
  id?: string;
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
    console.log("set drop target", dropTarget);
    this.dropTarget = dropTarget;
  };

  handleDrop = () => {
    if (this.dragSource && this.dropTarget && this.dragSource.type === "note") {
      if (this.dropTarget.type === "notetree-note") {
        // let draggedNoteId = this.dragSource.data.id;
        // let { parentId, position } = this.dropTarget.data;
        // this.dropNoteOnNote(parentId, draggedNoteId, position);
      } else if (this.dropTarget.type === "notetree-line") {
        console.log("drop in note tree line");
        let draggedNoteId = this.dragSource.data.id;
        let { parentId, position } = this.dropTarget.data;
        this.dropNoteOnLineIndicator(draggedNoteId, parentId, position);
      }
    }
  };

  dropNoteOnNote = (
    parentId: string | null = null,
    draggedNoteId: string | null = null,
    position: number = -1,
  ) => {
    if (!draggedNoteId || position === -1) return;

    noteController.moveNoteToPosition(draggedNoteId, parentId, position);
  };

  dropNoteOnLineIndicator = (
    parentId: string | null = null,
    draggedNoteId: string | null = null,
    position: number = -1,
  ) => {
    if (!draggedNoteId || position === -1) return;

    noteController.moveNoteToPosition(draggedNoteId, parentId, position);
  };
}
export const dndController = $state(new DndController());
