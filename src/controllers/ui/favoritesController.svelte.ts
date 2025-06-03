import { noteQueryController } from "@controllers/note/noteQueryController.svelte";
import type { Note } from "@projectTypes/noteTypes";
import { favoritesModel } from "@model/favoritesModel.svelte";

class FavoriteController {
   // Comprobar si una nota está en favoritos
   isFavorite(noteId: string): boolean {
      return favoritesModel.favorites.some(
         (favoriteId) => favoriteId === noteId,
      );
   }

   getFavorites() {
      return favoritesModel.favorites;
   }

   getFavoritesAsNotes() {
      return noteQueryController.getNotesByIdList(favoritesModel.favorites);
   }

   // Añadir nota a favoritos
   addToFavorites = (noteId: Note["id"]): void => {
      if (!this.isFavorite(noteId)) {
         favoritesModel.favorites.push(noteId);
      }
   };

   // Eliminar nota de favoritos
   removeFromFavorites = (noteId: string): void => {
      favoritesModel.favorites = favoritesModel.favorites.filter(
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
