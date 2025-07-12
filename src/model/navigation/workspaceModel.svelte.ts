// workspaceModel.svelte.ts
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
   }

   protected getDefaultData(): WorkspaceData {
      return {
         tabs: [],
         activeTabId: undefined,
      };
   }

   // Método público para reinicializar después de que settings esté listo
   public reinitializeWithSettings(): void {
      if (settingsController.get("keepTabs") === false) {
         this.data = this.getDefaultData();
      }
   }
}

export const workspaceModel = $state(new WorkspaceModel());
