import { isDescendant } from "@utils/noteUtils";
import { DragSource, DropTarget } from "@projectTypes/dndTypes";
import { noteStore } from "modal/noteStore.svelte";
import { noteQueryController } from "@controllers/note/noteQueryController.svelte";
import { noteController } from "@controllers/note/noteController.svelte";
import { noteTreeController } from "@controllers/note/noteTreeController.svelte";
import { notePropertyController } from "./note/property/notePropertyController.svelte";

class DndController {
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
      if (!dropTarget) {
         console.warn("Drop target inválido:", dropTarget);
         return;
      }
      this.dropTarget = dropTarget;
   };

   getDragSourceId = (): string | undefined => this.dragSource?.id;
   getDropTargetId = (): string | undefined => this.dropTarget?.id;

   handleDrop = (): void => {
      if (!this.dragSource || !this.dropTarget) {
         console.warn("No se dispone de drag source o drop target al soltar");
         return;
      }
      try {
         switch (this.dragSource.type) {
            case "notetree-note":
               if (
                  this.dropTarget.type === "notetree-note" ||
                  this.dropTarget.type === "notetree-line"
               ) {
                  if (
                     this.dragSource.data.parentId !== undefined &&
                     this.dropTarget.id !== undefined &&
                     this.dragSource.data.parentId === this.dropTarget.id
                  ) {
                     console.warn(
                        "Intento de mover una nota dentro de su mismo padre, se ha ignorado.",
                     );
                     break;
                  }

                  this.noteTreeDnd();
               } else {
                  console.warn(
                     "Tipo de drop target no manejado para 'notetree-note':",
                     this.dropTarget.type,
                  );
               }
               break;
            case "property":
               if (this.dropTarget.type === "property") {
                  this.propertyDnd();
               } else {
                  console.warn(
                     "Tipo de drop target no manejado para 'property':",
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
      }
   };

   // Properties
   propertyDnd = (): void => {
      const { dragSource, dropTarget } = this;

      // Validar condiciones mínimas para continuar
      if (
         !dragSource ||
         !dragSource.id ||
         !dropTarget ||
         dropTarget.position == null
      ) {
         return;
      }

      const noteId = dragSource.data?.noteId;
      const propertyId = dragSource.id;
      const newPosition = dropTarget.position;

      // Validar que se tengan todos los datos necesarios
      if (!noteId || !propertyId || newPosition == null) {
         console.error(
            "Datos insuficientes para propertyDnd:",
            dragSource.data,
            dropTarget.data,
         );
         return;
      }

      notePropertyController.reorderNoteProperties(noteId, propertyId, newPosition);
   };

   // Note Tree
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
         if (
            isDescendant(noteStore.getAllNotes(), targetNoteId, draggedNoteId)
         ) {
            console.warn(
               "No se puede soltar una nota sobre un descendiente suyo",
            );
            return;
         }
         const targetNote = noteQueryController.getNoteById(targetNoteId);
         if (!targetNote) {
            console.error("Target note no encontrada:", targetNoteId);
            return;
         }
         // Se coloca la nota como primer hijo de la nota destino.
         this.dropNoteOnNote(targetNoteId, draggedNoteId, 0);
      } else if (this.dropTarget.type === "notetree-line") {
         // Validamos que los datos tengan la forma esperada.
         const position = this.dropTarget.position;
         if (position == null) {
            console.error(
               "Fallo posición en drop target de tipo notetree-line:",
               this.dropTarget.data,
            );
            return;
         }

         const targetParentId = this.dropTarget?.data.parentId;
         // Comprobamos que no se intente crear un ciclo: si se especifica un parentId, no puede ser igual a draggedNoteId ni su descendiente.
         if (
            targetParentId &&
            (targetParentId === draggedNoteId ||
               isDescendant(
                  noteStore.getAllNotes(),
                  targetParentId,
                  draggedNoteId,
               ))
         ) {
            console.warn(
               "No se puede soltar la nota en este target por ciclo o invalidación",
            );
            return;
         }

         // Validación adicional para drops en posiciones adyacentes
         if (
            this.dragSource &&
            this.dragSource.type === "notetree-note" &&
            this.dragSource.data.parentId === targetParentId &&
            (position === this.dragSource.position ||
               position === this.dragSource.position + 1)
         ) {
            console.warn(
               "Drop en posición adyacente a la original; se ignora el reordenamiento.",
            );
            return;
         }
         this.dropNoteOnLineIndicator(targetParentId, draggedNoteId, position);
      } else {
         console.warn(
            "Tipo de drop target no manejado para notetree-note:",
            this.dropTarget.type,
         );
      }
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
      noteTreeController.moveNoteToPosition(
         draggedNoteId,
         targetNoteId,
         position,
      );
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

      noteTreeController.moveNoteToPosition(draggedNoteId, parentId, position);
   };
}

export const dndController = $state(new DndController());
