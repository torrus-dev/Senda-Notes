import { sanitizeTitle } from "@utils/noteUtils";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";
import { noteController } from "@controllers/notes/noteController.svelte";

/**
 * Controlador especializado en la lógica de paths jerárquicos
 * Maneja la resolución y creación de notas desde paths como "proyecto/backend/auth"
 */
class NotePathController {
   /**
    * Crea notas desde un path jerárquico como "proyecto/backend/auth"
    */
   createNoteFromPath = (path: string): string | null => {
      try {
         const segments = this.parseNotePath(path);
         if (!segments.length) return null;

         const resolution = noteQueryController.resolveNotePath(segments);
         const targetNoteId = this.executeNoteCreation(resolution);

         return targetNoteId;
      } catch (error) {
         console.error("Error creating note from path:", error);
         return null;
      }
   };

   /**
    * Parsea un path en segmentos válidos
    */
   private parseNotePath(path: string): string[] {
      if (!path?.trim()) return [];

      return path
         .split("/")
         .map((segment) => sanitizeTitle(segment.trim()))
         .filter(Boolean);
   }

   /**
    * Ejecuta la creación de notas faltantes basándose en la resolución del path
    */
   private executeNoteCreation(resolution: any): string | null {
      if (!resolution.missingSegments.length) {
         // Todas las notas existen - retornar la última
         return (
            resolution.existingNotes[resolution.existingNotes.length - 1]?.id ||
            null
         );
      }

      return this.createMissingNotes(resolution);
   }

   /**
    * Crea todas las notas faltantes en secuencia
    */
   private createMissingNotes(resolution: any): string | null {
      let currentParentId = resolution.lastParentId;
      let lastCreatedId: string | null = null;

      for (const segment of resolution.missingSegments) {
         const noteId = noteController.createSingleNote(currentParentId, {
            title: segment,
         });

         if (!noteId) {
            console.error(`Failed to create note: ${segment}`);
            break;
         }

         lastCreatedId = noteId;
         currentParentId = noteId;
      }

      return lastCreatedId;
   }
}

export const notePathController = new NotePathController();
