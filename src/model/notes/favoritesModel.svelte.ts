import { PersistentLocalStorageModel } from "@model/persistentLocalStorageModel.svelte";
import type { Note } from "@projectTypes/core/noteTypes";

interface FavoritesState {
   favorites: Note["id"][];
}

class FavoritesModel extends PersistentLocalStorageModel<FavoritesState> {
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
