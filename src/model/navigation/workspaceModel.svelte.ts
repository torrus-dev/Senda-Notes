import { settingsController } from "@controllers/application/settingsController.svelte";
import { PersistentLocalStorageModel } from "@model/persistentLocalStorageModel.svelte";
import type { NoteReference } from "@projectTypes/core/noteTypes";

export interface Tab {
   noteReference: NoteReference | undefined;
   id: string;
}

interface WorkspaceData {
   tabs: Tab[];
   activeTabId: string | undefined;
}

class WorkspaceModel extends PersistentLocalStorageModel<WorkspaceData> {
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

export const workspaceModel = $state(new WorkspaceModel());
