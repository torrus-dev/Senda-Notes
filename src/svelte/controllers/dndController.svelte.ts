// Define los tipos específicos para el DnD
export type DragSource = {
  id: string;
  type: "note" | "tab" | "other";
  data: any;
};

export type DropTarget = {
  id: string;
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

  dropNoteOnLineIndicator = () => {
    this.dragSource;
  };
}
export const dndController = $state(new DndController());
