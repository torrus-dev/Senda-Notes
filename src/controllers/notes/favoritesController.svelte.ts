import type { Note } from "@projectTypes/core/noteTypes";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";
import { startupManager } from "@model/startup/startupManager.svelte";
import { FavoritesModel } from "@model/notes/favoritesModel.svelte";

class FavoriteController {
   private get favoritesModel(): FavoritesModel {
      return startupManager.getModel("favoritesModel");
   }

   // Comprobar si una nota está en favoritos
   isFavorite(noteId: string): boolean {
      return this.favoritesModel.data.favorites.some(
         (favoriteId) => favoriteId === noteId,
      );
   }

   getFavorites() {
      return this.favoritesModel.data.favorites;
   }

   getFavoritesAsNotes() {
      return noteQueryController.getNotesByIdList(
         this.favoritesModel.data.favorites,
      );
   }

   // Añadir nota a favoritos
   addToFavorites = (noteId: Note["id"]): void => {
      if (!this.isFavorite(noteId)) {
         this.favoritesModel.data.favorites.push(noteId);
      }
   };

   // Eliminar nota de favoritos
   removeFromFavorites = (noteId: string): void => {
      this.favoritesModel.data.favorites =
         this.favoritesModel.data.favorites.filter(
            (favoriteId) => favoriteId !== noteId,
         );
   };

   // Toggle favorito (bonus)
   toggleFavorite = (noteId: Note["id"]): void => {
      if (this.isFavorite(noteId)) {
         this.removeFromFavorites(noteId);
      } else {
         this.addToFavorites(noteId);
      }
   };
}

export const favoriteController = $state(new FavoriteController());
