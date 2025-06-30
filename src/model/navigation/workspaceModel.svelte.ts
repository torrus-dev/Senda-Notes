import { PersistentLocalStorageModel } from "@model/persistentLocalStorage.svelte";
import type { Note } from "@projectTypes/core/noteTypes";

interface WorkspaceData {
   tabs: Note["id"][]; // Array de pestañas abiertas
   activeTabId: string | undefined;
}

class WorkspaceModel extends PersistentLocalStorageModel<WorkspaceData> {
   constructor() {
      super("NoteNavigation");
   }

   protected getDefaultData(): WorkspaceData {
      return {
         tabs: [],
         activeTabId: undefined,
      };
   }
}

export const workspaceModel = $state(new WorkspaceModel());
