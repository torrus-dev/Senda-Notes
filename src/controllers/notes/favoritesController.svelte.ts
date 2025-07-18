import { FavoritesRepository } from "@infrastructure/repositories/FavoritesRepository";
import { Note } from "@domain/entities/Note";
import { startupManager } from "@model/startup/startupManager.svelte";
import { notificationController } from "@controllers/application/notificationController.svelte";
import { NoteQueryRepository } from "@infrastructure/repositories/NoteQueryRepository";

/**
 * Controlador delgado para favoritos
 */
class FavoritesController {
   // Estado reactivo para Svelte 5
   favoriteCount = $state(0);
   favoriteIds = $state<Set<string>>(new Set());

   private get repository(): FavoritesRepository {
      return startupManager.getService("favoritesRepository");
   }

   private get queryRepository(): NoteQueryRepository {
      return startupManager.getService("noteQueryRepository");
   }

   /**
    * Verifica si una nota es favorita
    */
   isFavorite(noteId: string): boolean {
      return this.repository.isFavorite(noteId);
   }

   /**
    * Obtiene todos los IDs de favoritos
    */
   getFavoriteIds(): string[] {
      return this.repository.getAll();
   }

   /**
    * Obtiene las notas favoritas
    */
   getFavoriteNotes(): Note[] {
      const favoriteSet = this.repository.getAllAsSet();
      return this.queryRepository.findFavorites(favoriteSet);
   }

   /**
    * Añade una nota a favoritos
    */
   addToFavorites(noteId: string): void {
      const note = this.queryRepository.findById(noteId);
      if (!note) {
         console.error(`Note ${noteId} not found`);
         return;
      }

      if (this.repository.add(noteId)) {
         this.updateReactiveState();
         notificationController.addNotification({
            message: `"${note.title}" añadida a favoritos`,
            type: "success",
         });
      }
   }

   /**
    * Elimina una nota de favoritos
    */
   removeFromFavorites(noteId: string): void {
      const note = this.queryRepository.findById(noteId);

      if (this.repository.remove(noteId)) {
         this.updateReactiveState();
         if (note) {
            notificationController.addNotification({
               message: `"${note.title}" eliminada de favoritos`,
               type: "base",
            });
         }
      }
   }

   /**
    * Toggle favorito
    */
   toggleFavorite(noteId: string): void {
      const note = this.queryRepository.findById(noteId);
      if (!note) {
         console.error(`Note ${noteId} not found`);
         return;
      }

      const isFavorite = this.repository.toggle(noteId);
      this.updateReactiveState();

      notificationController.addNotification({
         message: isFavorite
            ? `"${note.title}" añadida a favoritos`
            : `"${note.title}" eliminada de favoritos`,
         type: isFavorite ? "success" : "base",
      });
   }

   /**
    * Limpia favoritos que ya no existen
    */
   cleanupInvalidFavorites(): void {
      const allNotes = this.queryRepository.findAll();
      const validIds = new Set(allNotes.map((n) => n.id));

      const removed = this.repository.cleanupInvalid(validIds);

      if (removed > 0) {
         this.updateReactiveState();
         notificationController.addNotification({
            message: `${removed} favoritos inválidos eliminados`,
            type: "info",
         });
      }
   }

   /**
    * Reordena favoritos
    */
   reorderFavorites(orderedIds: string[]): void {
      this.repository.reorder(orderedIds);
      this.updateReactiveState();
   }

   /**
    * Actualiza el estado reactivo
    */
   private updateReactiveState(): void {
      this.favoriteCount = this.repository.count();
      this.favoriteIds = this.repository.getAllAsSet();
   }

   /**
    * Inicializa el estado reactivo
    */
   initialize(): void {
      this.updateReactiveState();
   }
}

// Singleton con proxy para lazy loading
let instance: FavoritesController | null = null;

export const favoritesController = new Proxy(
   {},
   {
      get(_, prop) {
         if (!instance) {
            instance = new FavoritesController();
            instance.initialize();
         }
         const value = instance[prop as keyof FavoritesController];
         return typeof value === "function" ? value.bind(instance) : value;
      },
   },
) as FavoritesController;
