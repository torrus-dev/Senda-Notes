import type { Note } from "@projectTypes/noteTypes";
import { noteController } from "@controllers/note/noteController.svelte";
import { noteQueryController } from "@controllers/note/noteQueryController.svelte";

class NoteTreeController {
   /**
    * Mueve una nota a una nueva posición en el árbol
    */
   moveNoteToPosition = (
      noteId: string,
      newParentId: string | undefined,
      position: number,
   ): void => {
      const note = noteQueryController.requireNote(noteId);

      // Validaciones previas
      if (newParentId) {
         this.validateParentRelationship(newParentId, noteId);
      }

      // 1. Eliminar referencia del padre anterior
      this.removeFromPreviousParent(note);

      // 2. Actualizar parentId de la nota
      noteController.updateNote(noteId, { parentId: newParentId });

      // 3. Insertar en nueva ubicación
      if (newParentId) {
         this.insertIntoParent(newParentId, noteId, position);
      } else {
         this.insertIntoRoot(noteId, position);
      }
   };

   /**
    * Obtiene todos los IDs descendientes de una nota (excluyendo la nota misma)
    */
   getDescendantIds = (noteId: string): Set<string> => {
      const descendants = new Set<string>();
      const allNotes = noteQueryController.getAllNotes();

      const collectDescendants = (currNoteId: string) => {
         descendants.add(currNoteId);
         allNotes.forEach((note) => {
            if (note.parentId === currNoteId) {
               collectDescendants(note.id);
            }
         });
      };

      // Recoger descendientes pero NO incluir el noteId inicial
      allNotes.forEach((note) => {
         if (note.parentId === noteId) {
            collectDescendants(note.id);
         }
      });

      return descendants;
   };

   /**
    * Verifica si mover una nota crearía un ciclo
    */
   wouldCreateCycle = (parentId: string, childId: string): boolean => {
      let current = noteQueryController.getNoteById(parentId);
      while (current?.parentId) {
         if (current.parentId === childId) return true;
         current = noteQueryController.getNoteById(current.parentId);
      }
      return false;
   };

   // Métodos de validación y auxiliares
   validateParentRelationship(newParentId: string, noteId: string): void {
      noteQueryController.requireNote(newParentId, "New parent note");

      if (newParentId === noteId) {
         throw new Error("Cannot move note to itself");
      }

      if (this.wouldCreateCycle(newParentId, noteId)) {
         throw new Error("Cannot move note to its own descendant");
      }
   }

   removeFromPreviousParent(note: Note): void {
      if (note.parentId) {
         const parent = noteQueryController.requireNote(note.parentId);
         const newChildren = parent.children.filter((id) => id !== note.id);
         noteController.updateNote(note.parentId, { children: newChildren });
      }
   }

   insertIntoParent(parentId: string, noteId: string, position: number): void {
      const parent = noteQueryController.requireNote(parentId);
      const children = [...parent.children];

      // Filtrar el noteId si ya existe
      const filtered = children.filter((id) => id !== noteId);
      const originalIndex = children.indexOf(noteId);

      // Calcular posición ajustada usando la lógica original
      const adjustedPosition = this.getAdjustedPosition(
         originalIndex,
         position,
         filtered.length,
      );

      // Insertar en la posición correcta
      const newChildren = [
         ...filtered.slice(0, adjustedPosition),
         noteId,
         ...filtered.slice(adjustedPosition),
      ];

      noteController.updateNote(parentId, { children: newChildren });
   }

   insertIntoRoot(noteId: string, position: number): void {
      const allNotes = noteQueryController.getAllNotes();
      const rootNotes = allNotes.filter((note) => !note.parentId);
      const notesWithParents = allNotes.filter((note) => note.parentId);

      // Filtrar la nota movida de rootNotes
      const filteredRootNotes = rootNotes.filter((note) => note.id !== noteId);
      const movedNote = noteQueryController.requireNote(noteId);

      // Calcular posición original y ajustada
      const originalIndex = rootNotes.findIndex((note) => note.id === noteId);
      const adjustedPosition = this.getAdjustedPosition(
         originalIndex,
         position,
         filteredRootNotes.length,
      );

      // Crear nuevo array de root notes con la nota en la posición correcta
      const newRootNotes = [
         ...filteredRootNotes.slice(0, adjustedPosition),
         movedNote,
         ...filteredRootNotes.slice(adjustedPosition),
      ];

      // Actualizar el array completo manteniendo el orden: root notes + notes with parents
      const newNotesOrder = [...newRootNotes, ...notesWithParents];
      noteController.setAllNotes(newNotesOrder);
   }

   /**
    * Calcula la posición ajustada considerando si el elemento ya existe en el array
    * Lógica original preservada del código base
    */
   getAdjustedPosition(
      originalIndex: number,
      targetPosition: number,
      maxLength: number,
   ): number {
      let adjusted = targetPosition;

      // Si el elemento ya existía y está antes de la posición objetivo, ajustar
      if (originalIndex !== -1 && originalIndex < targetPosition) {
         adjusted = targetPosition - 1;
      }

      // Clamping para mantener dentro de límites válidos
      return Math.max(0, Math.min(adjusted, maxLength));
   }
}

export const noteTreeController = new NoteTreeController();
