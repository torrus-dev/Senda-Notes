import type { Note } from "@projectTypes/noteTypes";
import { noteStore } from "@stores/noteStore.svelte";
import { updateModifiedMetadata } from "@utils/noteUtils";
import { noteQueryController } from "./noteQueryController.svelte";

class NoteTreeController {
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
      this.updateNoteParentId(noteId, newParentId);
      const updatedNote = noteQueryController.getNoteById(noteId)!;

      // 3. Insertar en nueva ubicación
      if (newParentId) {
         this.insertIntoParent(newParentId, updatedNote.id, position);
      } else {
         this.insertIntoRoot(updatedNote, position);
      }
   };

   getDescendantIds = (noteId: string): Set<string> => {
      const idsToDelete = new Set<string>();
      const collectDescendants = (currNoteId: string) => {
         idsToDelete.add(currNoteId);
         noteStore.getAllNotes().forEach((note) => {
            if (note.parentId === currNoteId) {
               collectDescendants(note.id);
            }
         });
      };

      // Llamamos a la función recursiva pero no incluimos el ID inicial
      // ya que eso lo hace el método llamador cuando sea necesario
      const notes = noteStore.getAllNotes();
      notes.forEach((note) => {
         if (note.parentId === noteId) {
            collectDescendants(note.id);
         }
      });

      return idsToDelete;
   };

   /* ----------------- Funciones auxiliares ----------------- */

   wouldCreateCycle = (parentId: string, childId: string): boolean => {
      let current = noteQueryController.getNoteById(parentId);
      while (current?.parentId) {
         if (current.parentId === childId) return true;
         current = noteQueryController.getNoteById(current.parentId);
      }
      return false;
   };

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
         this.updateParentChildren(note.parentId, (children) =>
            children.filter((id) => id !== note.id),
         );
      }
   }

   updateNoteParentId(noteId: string, newParentId: string | undefined): void {
      noteStore.updateNotes((notes) =>
         notes.map((n) =>
            n.id === noteId
               ? updateModifiedMetadata({ ...n, parentId: newParentId })
               : n,
         ),
      );
   }

   insertIntoParent(parentId: string, noteId: string, position: number): void {
      this.updateParentChildren(parentId, (children) => {
         const filtered = children.filter((id) => id !== noteId);
         const originalIndex = children.indexOf(noteId);
         const adjustedPosition = this.getAdjustedPosition(
            originalIndex,
            position,
            filtered.length,
         );

         return [
            ...filtered.slice(0, adjustedPosition),
            noteId,
            ...filtered.slice(adjustedPosition),
         ];
      });
   }

   insertIntoRoot(movedNote: Note, position: number): void {
      const rootNotes = noteQueryController
         .getRootNotes()
         .filter((note: Note) => note.id !== movedNote.id);
      const originalIndex = rootNotes.findIndex(
         (note: Note) => note.id === movedNote.id,
      );
      const adjustedPosition = this.getAdjustedPosition(
         originalIndex,
         position,
         rootNotes.length,
      );

      const newRootNotes = [
         ...rootNotes.slice(0, adjustedPosition),
         movedNote,
         ...rootNotes.slice(adjustedPosition),
      ];

      const notesWithParents = noteStore
         .getAllNotes()
         .filter((n) => n.parentId);
      noteStore.setNotes([...newRootNotes, ...notesWithParents]);
   }

   getAdjustedPosition(
      originalIndex: number,
      targetPosition: number,
      maxLength: number,
   ): number {
      let adjusted = targetPosition;
      if (originalIndex !== -1 && originalIndex < targetPosition) {
         adjusted = targetPosition - 1; // Ajuste por movimiento dentro del mismo contenedor
      }
      return Math.max(0, Math.min(adjusted, maxLength)); // Clamping correcto
   }

   updateParentChildren(
      parentId: string,
      updateFn: (children: string[]) => string[],
   ): void {
      noteStore.updateNotes((notes) =>
         notes.map((n) =>
            n.id === parentId
               ? updateModifiedMetadata({
                    ...n,
                    children: updateFn(n.children),
                 })
               : n,
         ),
      );
   }
}

export let noteTreeController = $state(new NoteTreeController());
