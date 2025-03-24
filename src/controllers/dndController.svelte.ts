import { isDescendant } from "../lib/utils/noteUtils";
import { noteController } from "./noteController.svelte";
import { propertyController } from "./propertyController.svelte";

// Define los tipos específicos para el DnD
export type DragSource = {
  id?: string;
  type: "notetree-note" | "tab" | "property" | "other";
  data?: any;
};

export type DropTarget = {
  id?: string;
  type:
    | "notetree-note"
    | "notetree-line"
    | "tab-area"
    | "property-line"
    | "other";
  data?: any;
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

  setDragSource = (dragSource: DragSource) => {
    this.dragSource = dragSource;
  };

  setDropTarget = (dropTarget: DropTarget) => {
    this.dropTarget = dropTarget;
  };

  getDragSourceId = (): string | undefined => {
    return this.dragSource ? this.dragSource.id : undefined;
  };

  handleDrop = () => {
    if (this.dragSource && this.dropTarget) {
      if (this.dragSource.type === "notetree-note") {
        this.noteTreeDnd();
      } else if (
        this.dragSource.type === "property" &&
        this.dropTarget.type === "property-line"
      ) {
        this.propertyDnd();
      }

      this.clearDragAndDrop();
    }
  };

  noteTreeDnd = () => {
    if (this.dragSource && this.dropTarget) {
      if (this.dropTarget.type === "notetree-note") {
        // Cuando soltamos una nota sobre otra nota, la convertimos en hijo
        let draggedNoteId = this.dragSource.id;
        let targetNoteId = this.dropTarget.id;

        // Verificamos que la nota destino no sea ella misma o no sea un descendiente de la nota arrastrada
        if (
          targetNoteId &&
          draggedNoteId &&
          targetNoteId !== draggedNoteId &&
          !isDescendant(noteController.notes, targetNoteId, draggedNoteId)
        ) {
          // La nota se coloca como último hijo de la nota destino (posición children.length)
          const targetNote = noteController.getNoteById(targetNoteId);
          if (targetNote) {
            this.dropNoteOnNote(
              targetNoteId,
              draggedNoteId,
              targetNote.children.length,
            );
          }
        }
      } else if (this.dropTarget.type === "notetree-line") {
        let draggedNoteId = this.dragSource.id;
        let { parentId, position } = this.dropTarget.data;

        // permitir soltar a root o cuando no coincidan los IDs y no estemos arrastrando una nota a un elemento descendiente
        if (
          draggedNoteId &&
          (!parentId ||
            (parentId !== draggedNoteId &&
              !isDescendant(noteController.notes, parentId, draggedNoteId)))
        ) {
          this.dropNoteOnLineIndicator(parentId, draggedNoteId, position);
        }
      }
    }
  };

  propertyDnd = () => {
    if (this.dragSource && this.dropTarget) {
      let { noteId, propertyId } = this.dragSource.data;
      let { position } = this.dropTarget.data;
      propertyController.reorderProperty(noteId, propertyId, position);
    }
  };

  dropNoteOnNote = (
    targetNoteId: string,
    draggedNoteId: string,
    position: number = -1,
  ) => {
    if (!draggedNoteId || !targetNoteId) return;

    // Movemos la nota arrastrada como hijo de la nota destino
    noteController.moveNoteToPosition(draggedNoteId, targetNoteId, position);
  };

  dropNoteOnLineIndicator = (
    parentId: string | null,
    draggedNoteId: string,
    position: number,
  ) => {
    if (!draggedNoteId || position === -1) return;

    // Movemos la nota arrastrada a la posición específica dentro del padre
    noteController.moveNoteToPosition(draggedNoteId, parentId, position);
  };
}
export const dndController = $state(new DndController());
