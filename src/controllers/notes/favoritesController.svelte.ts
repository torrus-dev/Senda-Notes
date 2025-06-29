import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";
import type { Note } from "@projectTypes/core/noteTypes";
import { favoritesModel } from "@model/notes/favoritesModel.svelte";

class FavoriteController {
   // Comprobar si una nota está en favoritos
   isFavorite(noteId: string): boolean {
      return favoritesModel.data.favorites.some(
         (favoriteId) => favoriteId === noteId,
      );
   }

   getFavorites() {
      return favoritesModel.data.favorites;
   }

   getFavoritesAsNotes() {
      return noteQueryController.getNotesByIdList(
         favoritesModel.data.favorites,
      );
   }

   // Añadir nota a favoritos
   addToFavorites = (noteId: Note["id"]): void => {
      if (!this.isFavorite(noteId)) {
         favoritesModel.data.favorites.push(noteId);
      }
   };

   // Eliminar nota de favoritos
   removeFromFavorites = (noteId: string): void => {
      favoritesModel.data.favorites = favoritesModel.data.favorites.filter(
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
