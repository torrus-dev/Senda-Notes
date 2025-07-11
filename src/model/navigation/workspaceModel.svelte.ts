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
   constructor() {
      super("NoteNavigation");
      // Removemos la lógica de keepTabs del constructor
      // Esto se manejará durante el bootstrap
   }

   protected getDefaultData(): WorkspaceData {
      return {
         tabs: [],
         activeTabId: undefined,
      };
   }

   // Método público para resetear a defaults
   resetToDefaults(): void {
      this.data = this.getDefaultData();
   }
}

export const workspaceModel = $state(new WorkspaceModel());
