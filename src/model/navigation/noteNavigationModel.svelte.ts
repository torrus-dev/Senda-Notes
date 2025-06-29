import { PersistentLocalStorageModel } from "@model/persistentLocalStorage.svelte";

interface NoteNavigationData {
   activeNoteId: string | undefined;
   previousActiveNoteId: string | undefined;
}

class NoteNavigationModel extends PersistentLocalStorageModel<NoteNavigationData> {
   constructor() {
      super("NoteNavigation");
   }

   protected getDefaultData(): NoteNavigationData {
      return {
         activeNoteId: undefined,
         previousActiveNoteId: undefined,
      };
   }
}

export const noteNavigationModel = $state(new NoteNavigationModel());
