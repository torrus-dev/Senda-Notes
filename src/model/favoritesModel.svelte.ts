import type { Note } from "@projectTypes/noteTypes";

const FAVORITES_STORAGE_KEY = "favorites";

interface FavoritesState {
   favorites: Note["id"][];
}

class FavoritesModel {
   data: FavoritesState = $state({
      favorites: [],
   });

   constructor() {
      // Cargar favoritos del almacenamiento
      const loadedFavorites = this.loadFavoritesState();
      if (loadedFavorites && Array.isArray(loadedFavorites)) {
         this.data.favorites = loadedFavorites;
      }

      // Persistir cambios automáticamente
      $effect.root(() => {
         $effect(() => {
            this.saveFavoritesState(this.data.favorites);
         });
      });
   }
   // Función que guarda favoritos en localStorage
   private saveFavoritesState = (
      favorites: Note["id"][],
      storage: Storage = localStorage,
   ): Note["id"][] => {
      const serialized = JSON.stringify(favorites);
      storage.setItem(FAVORITES_STORAGE_KEY, serialized);
      return favorites;
   };

   // Función que carga favoritos desde localStorage
   private loadFavoritesState = (
      storage: Storage = localStorage,
   ): Note["id"][] | null => {
      const serialized = storage.getItem(FAVORITES_STORAGE_KEY);
      return serialized ? JSON.parse(serialized) : null;
   };

   get favorites() {
      return this.data.favorites;
   }

   set favorites(value: Note["id"][]) {
      this.data.favorites = value;
   }
}

export let favoritesModel = $state(new FavoritesModel());
