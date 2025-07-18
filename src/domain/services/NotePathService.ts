import { Note } from "@domain/entities/Note";
import { sanitizeTitle } from "@utils/noteUtils";
import { normalizeText } from "@utils/searchUtils";

export interface PathResolution {
   existingNotes: Note[];
   missingSegments: string[];
   lastParentId?: string;
}

/**
 * Servicio de dominio para manejar paths jerárquicos de notas
 */
export class NotePathService {
   /**
    * Parsea un path en segmentos válidos
    */
   parseNotePath(path: string): string[] {
      if (!path?.trim()) return [];

      return path
         .split("/")
         .map((segment) => sanitizeTitle(segment.trim()))
         .filter(Boolean);
   }

   /**
    * Resuelve un path jerárquico y determina qué notas existen y cuáles faltan
    */
   resolveNotePath(pathSegments: string[], allNotes: Note[]): PathResolution {
      const resolution: PathResolution = {
         existingNotes: [],
         missingSegments: [],
         lastParentId: undefined,
      };

      let currentParentId: string | undefined;

      for (const segment of pathSegments) {
         const existingNote = this.findNoteByTitleAndParent(
            segment,
            currentParentId,
            allNotes,
         );

         if (existingNote) {
            resolution.existingNotes.push(existingNote);
            currentParentId = existingNote.id;
         } else {
            // Primer segmento faltante - guardar resto y salir
            const currentIndex = resolution.existingNotes.length;
            resolution.missingSegments = pathSegments.slice(currentIndex);
            resolution.lastParentId = currentParentId;
            break;
         }
      }

      return resolution;
   }

   /**
    * Busca una nota por título exacto y padre específico
    */
   private findNoteByTitleAndParent(
      title: string,
      parentId: string | undefined,
      allNotes: Note[],
   ): Note | null {
      const normalizedTitle = normalizeText(title);

      return (
         allNotes.find((note) => {
            const matchesParent = note.parentId === parentId;
            const matchesTitle = normalizeText(note.title) === normalizedTitle;
            return matchesParent && matchesTitle;
         }) || null
      );
   }

   /**
    * Genera una lista de títulos únicos para las notas faltantes
    */
   generateUniqueSegmentTitles(
      missingSegments: string[],
      parentId: string | undefined,
      allNotes: Note[],
   ): { parentId: string | undefined; title: string }[] {
      const result: { parentId: string | undefined; title: string }[] = [];
      let currentParentId = parentId;

      for (const segment of missingSegments) {
         // Obtener notas hermanas para validar unicidad
         const siblingNotes = allNotes.filter(
            (note) => note.parentId === currentParentId,
         );

         // Generar título único si es necesario
         const uniqueTitle = this.ensureUniqueTitle(segment, siblingNotes);

         result.push({
            parentId: currentParentId,
            title: uniqueTitle,
         });

         // El ID real se asignará cuando se cree la nota
         // Por ahora usamos un placeholder
         currentParentId = `pending-${result.length}`;
      }

      return result;
   }

   /**
    * Asegura que un título sea único entre notas hermanas
    */
   private ensureUniqueTitle(
      proposedTitle: string,
      siblingNotes: Note[],
   ): string {
      let title = proposedTitle;
      let counter = 1;

      while (siblingNotes.some((note) => note.title === title)) {
         title = `${proposedTitle} ${counter}`;
         counter++;
      }

      return title;
   }

   /**
    * Convierte un array de notas en un path string
    */
   buildPathString(notes: Note[]): string {
      return notes.map((note) => note.title).join("/");
   }

   /**
    * Obtiene el path completo de una nota como array
    */
   getNotePath(noteId: string, allNotes: Note[]): Note[] {
      const path: Note[] = [];
      let currentNote = allNotes.find((n) => n.id === noteId);

      while (currentNote) {
         path.unshift(currentNote);
         currentNote = currentNote.parentId
            ? allNotes.find((n) => n.id === currentNote!.parentId)
            : undefined;
      }

      return path;
   }
}
