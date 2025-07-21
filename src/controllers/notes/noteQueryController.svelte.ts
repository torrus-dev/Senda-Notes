import { Note } from "@domain/entities/Note";
import { NoteQueryRepository } from "@infrastructure/repositories/core/NoteQueryRepository";
import { startupManager } from "@infrastructure/startup/startupManager.svelte";
import { workspaceController } from "@controllers/navigation/workspaceController.svelte";
import { NoteTreeService } from "@domain/services/NoteTreeService";

/**
 * Controlador de queries - coordina consultas con la UI
 */
class NoteQueryController {
   // Estado reactivo
   searchResults = $state<Note[]>([]);
   isSearching = $state(false);

   private get queryRepository(): NoteQueryRepository {
      return startupManager.getService("noteQueryRepository");
   }

   /**
    * Obtiene una nota por ID
    */
   getNoteById(noteId: string): Note | undefined {
      return this.queryRepository.findById(noteId);
   }

   /**
    * Obtiene todas las notas
    */
   getAllNotes(): Note[] {
      return this.queryRepository.findAll();
   }

   /**
    * Obtiene las notas raíz
    */
   getRootNotes(): Note[] {
      return this.queryRepository.findRootNotes();
   }

   /**
    * Obtiene la nota activa
    */
   getActiveNote(): Note | undefined {
      const activeNoteId = workspaceController.activeNoteId;
      return activeNoteId ? this.getNoteById(activeNoteId) : undefined;
   }

   /**
    * Obtiene el path de una nota
    */
   getNotePathAsArray(noteId: string): Array<{ id: string; title: string }> {
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

   /**
    * Obtiene el path como string
    */
   getNotePathAsString(noteId: string): string {
      return this.getNotePathAsArray(noteId)
         .map((p) => p.title)
         .join("/");
   }

   /**
    * Busca notas por título
    */
   searchByTitle(query: string): Note[] {
      this.isSearching = true;
      this.searchResults = this.queryRepository.findByTitle(query);
      this.isSearching = false;
      return this.searchResults;
   }

   /**
    * Busca notas por contenido
    */
   searchByContent(query: string): Note[] {
      this.isSearching = true;
      this.searchResults = this.queryRepository.searchByContent(query);
      this.isSearching = false;
      return this.searchResults;
   }

   /**
    * Obtiene hijos directos
    */
   getDirectChildren(noteId: string): Note[] {
      return this.queryRepository.findByParent(noteId);
   }

   /**
    * Cuenta descendientes
    */
   getDescendantCount(noteId: string): number {
      const treeService: NoteTreeService =
         startupManager.getService("noteTreeService");
      const allNotes = this.getAllNotes();
      return treeService.countDescendants(noteId, allNotes);
   }

   /**
    * Valida si existe un padre
    */
   validateParentExists(parentId: string): boolean {
      const exists = this.queryRepository.exists(parentId);
      if (!exists) {
         console.error(`Parent note with id ${parentId} not found`);
      }
      return exists;
   }

   /**
    * Obtiene notas favoritas
    */
   getFavoriteNotes(favoriteIds: Set<string>): Note[] {
      return this.queryRepository.findFavorites(favoriteIds);
   }

   /**
    * Obtiene estadísticas
    */
   getStats() {
      return {
         totalNotes: this.queryRepository.count(),
         rootNotes: this.getRootNotes().length,
         notesWithStats: this.queryRepository.findWithStats().length,
      };
   }

   /**
    * Limpia resultados de búsqueda
    */
   clearSearchResults(): void {
      this.searchResults = [];
   }
}

// Singleton con proxy
let instance: NoteQueryController | null = null;

export const noteQueryController = new Proxy(
   {},
   {
      get(_, prop) {
         if (!instance) instance = new NoteQueryController();
         const value = instance[prop as keyof NoteQueryController];
         return typeof value === "function" ? value.bind(instance) : value;
      },
   },
) as NoteQueryController;
