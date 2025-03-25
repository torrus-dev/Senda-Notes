import { isDescendant } from "../lib/utils/noteUtils";
import { noteController } from "./noteController.svelte";
import { propertyController } from "./propertyController.svelte";

// Tipos específicos para los datos de drop según el tipo de drop target.
interface NoteTreeLineData {
  parentId?: string;
  position: number;
}

interface PropertyLineData {
  position: number;
}

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

  clearDragAndDrop = (): void => {
    this.isDragging = false;
    this.dragSource = undefined;
    this.dropTarget = undefined;
  };

  setDragSource = (dragSource: DragSource): void => {
    if (!dragSource || !dragSource.id) {
      console.warn("Drag source inválido:", dragSource);
      return;
    }
    this.dragSource = dragSource;
    this.isDragging = true;
  };

  setDropTarget = (dropTarget: DropTarget): void => {
    if (!dropTarget || !dropTarget.id) {
      console.warn("Drop target inválido:", dropTarget);
      return;
    }
    this.dropTarget = dropTarget;
  };

  getDragSourceId = (): string | undefined => this.dragSource?.id;

  handleDrop = (): void => {
    if (!this.dragSource || !this.dropTarget) {
      console.warn("No se dispone de drag source o drop target al soltar");
      this.clearDragAndDrop();
      return;
    }
    try {
      switch (this.dragSource.type) {
        case "notetree-note":
          this.noteTreeDnd();
          break;
        case "property":
          if (this.dropTarget.type === "property-line") {
            this.propertyDnd();
          } else {
            console.warn(
              "Tipo de drop target no manejado para property:",
              this.dropTarget.type,
            );
          }
          break;
        default:
          console.warn(
            "Tipo de drag source no manejado:",
            this.dragSource.type,
          );
          break;
      }
    } catch (error) {
      console.error("Error en handleDrop:", error);
    } finally {
      this.clearDragAndDrop();
    }
  };

  noteTreeDnd = (): void => {
    const draggedNoteId = this.dragSource?.id;
    if (!draggedNoteId) {
      console.error("Dragged note ID no definido");
      return;
    }

    if (!this.dropTarget) return;

    if (this.dropTarget.type === "notetree-note") {
      const targetNoteId = this.dropTarget.id;
      if (!targetNoteId) {
        console.error("Target note ID no definido para notetree-note");
        return;
      }
      if (targetNoteId === draggedNoteId) {
        console.warn("No se puede soltar una nota sobre sí misma");
        return;
      }
      if (isDescendant(noteController.notes, targetNoteId, draggedNoteId)) {
        console.warn("No se puede soltar una nota sobre un descendiente suyo");
        return;
      }
      const targetNote = noteController.getNoteById(targetNoteId);
      if (!targetNote) {
        console.error("Target note no encontrada:", targetNoteId);
        return;
      }
      // Se coloca la nota como último hijo de la nota destino.
      this.dropNoteOnNote(
        targetNoteId,
        draggedNoteId,
        targetNote.children.length,
      );
    } else if (this.dropTarget.type === "notetree-line") {
      // Validamos que los datos tengan la forma esperada.
      const data = this.dropTarget.data as NoteTreeLineData | undefined;
      if (!data || typeof data.position !== "number") {
        console.error(
          "Datos inválidos en drop target de tipo notetree-line:",
          this.dropTarget.data,
        );
        return;
      }
      const { parentId, position } = data;
      // Comprobamos que no se intente crear un ciclo: si se especifica un parentId, no puede ser igual a draggedNoteId ni su descendiente.
      if (
        parentId &&
        (parentId === draggedNoteId ||
          isDescendant(noteController.notes, parentId, draggedNoteId))
      ) {
        console.warn(
          "No se puede soltar la nota en este target por ciclo o invalidación",
        );
        return;
      }
      this.dropNoteOnLineIndicator(parentId, draggedNoteId, position);
    } else {
      console.warn(
        "Tipo de drop target no manejado para notetree-note:",
        this.dropTarget.type,
      );
    }
  };

  propertyDnd = (): void => {
    const { noteId, propertyId } = this.dragSource?.data || {};
    const data = this.dropTarget?.data as PropertyLineData | undefined;
    if (!noteId || !propertyId || !data || typeof data.position !== "number") {
      console.error(
        "Datos insuficientes para propertyDnd:",
        this.dragSource?.data,
        this.dropTarget?.data,
      );
      return;
    }
    propertyController.reorderProperty(noteId, propertyId, data.position);
  };

  dropNoteOnNote = (
    targetNoteId: string,
    draggedNoteId: string,
    position: number = -1,
  ): void => {
    if (!draggedNoteId || !targetNoteId) {
      console.error("IDs no definidos en dropNoteOnNote");
      return;
    }
    noteController.moveNoteToPosition(draggedNoteId, targetNoteId, position);
  };

  dropNoteOnLineIndicator = (
    parentId: string | undefined,
    draggedNoteId: string,
    position: number,
  ): void => {
    if (!draggedNoteId || position < 0) {
      console.error("Datos inválidos en dropNoteOnLineIndicator");
      return;
    }
    noteController.moveNoteToPosition(draggedNoteId, parentId, position);
  };
}

export const dndController = $state(new DndController());
