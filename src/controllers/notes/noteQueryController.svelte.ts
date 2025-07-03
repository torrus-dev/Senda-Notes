import type { Note } from "@projectTypes/core/noteTypes";
import { noteModel } from "@model/notes/noteModel.svelte";
import { getDescendantsId } from "@utils/noteUtils";
import { workspaceController } from "@controllers/navigation/workspaceController.svelte";
import { normalizeText } from "@utils/searchUtils";

// Tipos para resolución de paths
interface PathResolution {
   existingNotes: Note[];
   missingSegments: string[];
   lastParentId?: string;
}

class NoteQueryController {
   getNoteById = noteModel.getNoteById.bind(noteModel);
   getAllNotes = noteModel.getAllNotes.bind(noteModel);

   // === MÉTODOS BÁSICOS ===
   getRootNotes() {
      return noteModel.getAllNotes().filter((note) => !note.parentId);
   }

   getNotesByIdList(idList: string[]): Note[] {
      return idList
         .map(this.getNoteById)
         .filter((note): note is Note => note !== undefined);
   }

   getActiveNote(): Note | undefined {
      const activeNoteId = workspaceController.activeNoteId;
      return activeNoteId ? this.getNoteById(activeNoteId) : undefined;
   }

   // === MÉTODOS DE PATH ===
   getPathAsArray(noteId: string): Array<{ id: string; title: string }> {
      const path: Array<{ id: string; title: string }> = [];
      let currentNote = this.getNoteById(noteId);

      while (currentNote) {
         path.unshift({ id: currentNote.id, title: currentNote.title });
         currentNote = currentNote.parentId
            ? this.getNoteById(currentNote.parentId)
            : undefined;
      }

      return path;
   }

   getPathAsString(noteId: string): string {
      return this.getPathAsArray(noteId)
         .map((p) => p.title)
         .join("/");
   }

   // === MÉTODOS DE BÚSQUEDA ===
   /**
    * Busca una nota por título exacto y padre específico
    */
   findNoteByTitleAndParent(title: string, parentId?: string): Note | null {
      const normalizedTitle = normalizeText(title);

      return (
         this.getAllNotes().find((note) => {
            const matchesParent = (note.parentId || undefined) === parentId;
            const matchesTitle = normalizeText(note.title) === normalizedTitle;
            return matchesParent && matchesTitle;
         }) || null
      );
   }

   /**
    * Resuelve un path jerárquico y determina qué notas existen y cuáles faltan
    */
   resolveNotePath(pathSegments: string[]): PathResolution {
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

   // === MÉTODOS DE ESTADÍSTICAS ===
   getNoteCount(): number {
      return this.getAllNotes().length;
   }

   getChildrenCount(noteId: string): number {
      const note = this.getNoteById(noteId);
      return note ? getDescendantsId(this.getAllNotes(), noteId).length : 0;
   }

   // === MÉTODOS DE DESCENDIENTES ===
   /**
    * Obtiene todos los IDs descendientes de una nota (excluyendo la nota misma)
    */
   getDescendantIds(noteId: string): Set<string> {
      const descendants = new Set<string>();
      const allNotes = this.getAllNotes();

      const collectDescendants = (currNoteId: string) => {
         allNotes.forEach((note) => {
            if (note.parentId === currNoteId) {
               descendants.add(note.id);
               collectDescendants(note.id);
            }
         });
      };

      collectDescendants(noteId);
      return descendants;
   }

   // === MÉTODOS DE VALIDACIÓN ===
   requireNote(id: string, context = "Note"): Note {
      const note = this.getNoteById(id);
      if (!note) throw new Error(`${context} ${id} not found`);
      return note;
   }

   validateParentExists(parentId: string): boolean {
      if (!this.getNoteById(parentId)) {
         console.error(`Parent note with id ${parentId} not found`);
         return false;
      }
      return true;
   }

   /**
    * Verifica si mover una nota crearía un ciclo
    */
   wouldCreateCycle(parentId: string, childId: string): boolean {
      let current = this.getNoteById(parentId);
      while (current?.parentId) {
         if (current.parentId === childId) return true;
         current = this.getNoteById(current.parentId);
      }
      return false;
   }
}

export const noteQueryController = new NoteQueryController();
