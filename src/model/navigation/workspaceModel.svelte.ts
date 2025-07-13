import type { Tab } from "@projectTypes/ui/uiTypes";
import { settingsController } from "@controllers/application/settingsController.svelte";
import { PersistentLocalStorageModel } from "@model/persistentLocalStorageModel.svelte";

interface WorkspaceData {
   tabs: Tab[];
   activeTabId: string | undefined;
}

export class WorkspaceModel extends PersistentLocalStorageModel<WorkspaceData> {
   constructor() {
      super("NoteNavigation");
      if (settingsController.get("keepTabs") === false) {
         this.data = this.getDefaultData();
      }
   }

   protected getDefaultData(): WorkspaceData {
      return {
         tabs: [],
         activeTabId: undefined,
      };
   }
}
