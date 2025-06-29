import { PersistentLocalStorageModel } from "@model/persistentLocalStorage.svelte";
import type { Note } from "@projectTypes/core/noteTypes";

interface FavoritesState {
   favorites: Note["id"][];
}

class FavoritesModel extends PersistentLocalStorageModel<FavoritesState> {
   data: FavoritesState = $state({
      favorites: [],
   });

   constructor() {
      super("Favorites");
   }

   protected getDefaultData(): FavoritesState {
      return {
         favorites: [],
      };
   }
}

export let favoritesModel = $state(new FavoritesModel());
