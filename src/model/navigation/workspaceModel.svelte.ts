import type { Tab } from "@projectTypes/ui/uiTypes";
import { LocalStorageAdapter } from "@infrastructure/persistence/LocalStorageAdapter.svelte";

interface WorkspaceData {
   tabs: Tab[];
   activeTabId: string | undefined;
}

export class WorkspaceModel extends LocalStorageAdapter<WorkspaceData> {
   settingsAplied = false;
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
