import type { Tab } from "@projectTypes/ui/uiTypes";
import { PersistentLocalStorageModel } from "@model/persistentLocalStorageModel.svelte";

interface WorkspaceData {
   tabs: Tab[];
   activeTabId: string | undefined;
}

export class WorkspaceModel extends PersistentLocalStorageModel<WorkspaceData> {
   settingsAplied = false;
   constructor() {
      super("NoteNavigation");
      // No acceder a settings aquí
   }

   protected getDefaultData(): WorkspaceData {
      return {
         tabs: [],
         activeTabId: undefined,
      };
   }
}
