import { Note } from "@domain/entities/Note";

/**
 * Servicio de dominio para validaciones y operaciones del árbol de notas
 */
export class NoteTreeService {
   /**
    * Verifica si mover una nota crearía un ciclo
    */
   wouldCreateCycle(
      noteId: string,
      newParentId: string,
      allNotes: Note[],
   ): boolean {
      // No puede moverse a sí misma
      if (noteId === newParentId) {
         return true;
      }

      // Verificar si el nuevo padre es descendiente de la nota
      let current = allNotes.find((n) => n.id === newParentId);

      while (current?.parentId) {
         if (current.parentId === noteId) {
            return true;
         }
         current = allNotes.find((n) => n.id === current!.parentId);
      }

      return false;
   }

   /**
    * Valida si una nota puede moverse a una nueva posición
    */
   canMoveNote(
      noteId: string,
      newParentId: string | undefined,
      allNotes: Note[],
   ): { valid: boolean; reason?: string } {
      const note = allNotes.find((n) => n.id === noteId);

      if (!note) {
         return { valid: false, reason: "Note not found" };
      }

      // Si hay nuevo padre, verificar que exista
      if (newParentId) {
         const newParent = allNotes.find((n) => n.id === newParentId);
         if (!newParent) {
            return { valid: false, reason: "New parent not found" };
         }

         // Verificar ciclos
         if (this.wouldCreateCycle(noteId, newParentId, allNotes)) {
            return { valid: false, reason: "Would create cycle" };
         }
      }

      return { valid: true };
   }

   /**
    * Obtiene todos los descendientes de una nota
    */
   getDescendants(noteId: string, allNotes: Note[]): Note[] {
      const descendants: Note[] = [];
      const collectDescendants = (currentId: string) => {
         const children = allNotes.filter((n) => n.parentId === currentId);

         children.forEach((child) => {
            descendants.push(child);
            collectDescendants(child.id);
         });
      };

      collectDescendants(noteId);
      return descendants;
   }

   /**
    * Obtiene solo los hijos directos de una nota
    */
   getDirectChildren(noteId: string, allNotes: Note[]): Note[] {
      return allNotes.filter((note) => note.parentId === noteId);
   }

   /**
    * Calcula la posición ajustada para insertar un elemento
    */
   calculateAdjustedPosition(
      originalIndex: number,
      targetPosition: number,
      arrayLength: number,
   ): number {
      let adjusted = targetPosition;

      // Si el elemento ya existía y está antes de la posición objetivo, ajustar
      if (originalIndex !== -1 && originalIndex < targetPosition) {
         adjusted = targetPosition - 1;
      }

      // Mantener dentro de límites válidos
      return Math.max(0, Math.min(adjusted, arrayLength));
   }

   /**
    * Obtiene las notas raíz (sin padre)
    */
   getRootNotes(allNotes: Note[]): Note[] {
      return allNotes.filter((note) => !note.parentId);
   }

   /**
    * Obtiene la profundidad de una nota en el árbol
    */
   getNoteDepth(noteId: string, allNotes: Note[]): number {
      let depth = 0;
      let current = allNotes.find((n) => n.id === noteId);

      while (current?.parentId) {
         depth++;
         current = allNotes.find((n) => n.id === current!.parentId);
      }

      return depth;
   }

   /**
    * Verifica si una nota es ancestro de otra
    */
   isAncestor(
      ancestorId: string,
      descendantId: string,
      allNotes: Note[],
   ): boolean {
      let current = allNotes.find((n) => n.id === descendantId);

      while (current?.parentId) {
         if (current.parentId === ancestorId) {
            return true;
         }
         current = allNotes.find((n) => n.id === current!.parentId);
      }

      return false;
   }

   /**
    * Obtiene todos los ancestros de una nota
    */
   getAncestors(noteId: string, allNotes: Note[]): Note[] {
      const ancestors: Note[] = [];
      let current = allNotes.find((n) => n.id === noteId);

      while (current?.parentId) {
         const parent = allNotes.find((n) => n.id === current!.parentId);
         if (parent) {
            ancestors.push(parent);
            current = parent;
         } else {
            break;
         }
      }

      return ancestors;
   }

   /**
    * Cuenta el total de descendientes (recursivo)
    */
   countDescendants(noteId: string, allNotes: Note[]): number {
      return this.getDescendants(noteId, allNotes).length;
   }

   /**
    * Genera títulos únicos para notas hermanas
    */
   ensureUniqueSiblingTitle(
      title: string,
      parentId: string | undefined,
      allNotes: Note[],
      excludeNoteId?: string,
   ): string {
      const siblings = allNotes.filter(
         (note) => note.parentId === parentId && note.id !== excludeNoteId,
      );

      let uniqueTitle = title;
      let counter = 1;

      while (siblings.some((note) => note.title === uniqueTitle)) {
         uniqueTitle = `${title} ${counter}`;
         counter++;
      }

      return uniqueTitle;
   }
}
