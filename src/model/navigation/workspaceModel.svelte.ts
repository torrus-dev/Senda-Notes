import { settingsController } from "@controllers/application/settingsController.svelte";
import { PersistentLocalStorageModel } from "@model/persistentLocalStorage.svelte";
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
   saveTabs = $derived(settingsController.get("keepTabs"));
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
