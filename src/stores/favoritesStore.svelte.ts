// favoritesStore.svelte.ts
import type { Note } from "@projectTypes/noteTypes";

const FAVORITES_STORAGE_KEY = "favorites";

interface FavoritesState {
   favorites: Note[];
}

class FavoritesStore {
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

   // Función pura que convierte el array de favoritos en string
   private serializeFavoritesState = (favorites: Note[]): string => {
      return JSON.stringify(favorites);
   };

   // Función pura que convierte string en array de favoritos
   private deserializeFavoritesState = (serialized: string): Note[] => {
      return JSON.parse(serialized);
   };

   // Función que guarda favoritos en localStorage
   private saveFavoritesState = (
      favorites: Note[],
      storage: Storage = localStorage,
   ): Note[] => {
      const serialized = this.serializeFavoritesState(favorites);
      storage.setItem(FAVORITES_STORAGE_KEY, serialized);
      return favorites;
   };

   // Función que carga favoritos desde localStorage
   private loadFavoritesState = (
      storage: Storage = localStorage,
   ): Note[] | null => {
      const serialized = storage.getItem(FAVORITES_STORAGE_KEY);
      return serialized ? this.deserializeFavoritesState(serialized) : null;
   };

   get favorites() {
      return this.data.favorites;
   }

   set favorites(value: Note[]) {
      this.data.favorites = value;
   }
}

export let favoritesStore = $state(new FavoritesStore());
