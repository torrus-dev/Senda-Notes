import type { Note } from "@projectTypes/noteTypes";

class FavoriteController {
   favorites = $state<Note[]>([]);

   // Comprobar si una nota está en favoritos
   isFavorite = (noteId: string): boolean => {
      return this.favorites.some((note) => note.id === noteId);
   };

   // Añadir nota a favoritos
   addToFavorites = (note: Note): void => {
      if (!this.isFavorite(note.id)) {
         this.favorites.push(note);
      }
   };

   // Eliminar nota de favoritos
   removeFromFavorites = (noteId: string): void => {
      this.favorites = this.favorites.filter((note) => note.id !== noteId);
   };

   // Toggle favorito (bonus)
   toggleFavorite = (note: Note): void => {
      if (this.isFavorite(note.id)) {
         this.removeFromFavorites(note.id);
      } else {
         this.addToFavorites(note);
      }
   };
}

export const favoriteController = $state(new FavoriteController());
