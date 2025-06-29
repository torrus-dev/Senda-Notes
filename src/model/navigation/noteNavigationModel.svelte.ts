import { PersistentLocalStorageModel } from "@model/persistentLocalStorage.svelte";

interface NoteNavigationState {
   activeNoteId: string | undefined;
   previousActiveNoteId: string | undefined;
}

class NoteNavigationModel extends PersistentLocalStorageModel<NoteNavigationState> {
   constructor() {
      super("NoteNavigation");
   }

   protected getDefaultData(): NoteNavigationState {
      return {
         activeNoteId: undefined,
         previousActiveNoteId: undefined,
      };
   }
}

export const noteNavigationModel = $state(new NoteNavigationModel());
