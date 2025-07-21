import { FavoritesRepository } from "@infrastructure/repositories/core/FavoritesRepository";

/**
 * Casos de uso simples para favoritos
 * Principalmente para coordinación con otras operaciones
 */
export class FavoritesUseCases {
   constructor(private favoritesRepository: FavoritesRepository) {}

   /**
    * Limpia favoritos cuando se eliminan notas
    */
   handleNotesDeleted(deletedNoteIds: Set<string>): void {
      this.favoritesRepository.removeMany(deletedNoteIds);
   }

   /**
    * Valida y limpia favoritos inválidos
    */
   validateAndCleanup(validNoteIds: Set<string>): number {
      return this.favoritesRepository.cleanupInvalid(validNoteIds);
   }
}
