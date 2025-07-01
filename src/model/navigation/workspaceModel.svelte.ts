import { PersistentLocalStorageModel } from "@model/persistentLocalStorage.svelte";
import type { NoteReference } from "@projectTypes/core/noteTypes";

export interface Tab {
   noteReference: NoteReference;
   id: string;
}

interface WorkspaceData {
   tabs: Tab[];
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
