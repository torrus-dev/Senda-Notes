import type { Tab } from "@projectTypes/ui/uiTypes";
import { settingsController } from "@controllers/application/settingsController.svelte";
import { PersistentLocalStorageModel } from "@model/persistentLocalStorageModel.svelte";
import { startupManager } from "@model/startup/startupManager.svelte";

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

   // Override initialize para aplicar la lógica de settings después de cargar
   public initialize() {
      super.initialize();

      // Aplicar lógica después de inicializar
      $effect.root(() => {
         $effect(() => {
            if (
               !this.settingsAplied &&
               this.isInitialized &&
               startupManager.isReady
            ) {
               this.settingsAplied = true;
               try {
                  if (settingsController.get("keepTabs") === false) {
                     this.data = this.getDefaultData();
                  }
               } catch (error) {
                  console.warn(
                     "Error al acceder a settings en WorkspaceModel:",
                     error,
                  );
               }
            }
         });
      });
   }

   protected getDefaultData(): WorkspaceData {
      return {
         tabs: [],
         activeTabId: undefined,
      };
   }
}
