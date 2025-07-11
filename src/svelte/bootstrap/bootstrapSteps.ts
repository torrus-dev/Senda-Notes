// bootstrap/bootstrapSteps.ts
import { bootstrapManager } from "./bootstrapManager.svelte";
import { settingsModel } from "@model/application/settingsModel.svelte";
import { workspaceModel } from "@model/navigation/workspaceModel.svelte";
import { settingsController } from "@controllers/application/settingsController.svelte";

// Función para esperar a que un model se inicialice
async function waitForModelInitialization(
   model: any,
   timeout = 5000,
): Promise<void> {
   return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkInitialization = () => {
         if (model.isInitialized) {
            resolve();
         } else if (Date.now() - startTime > timeout) {
            reject(new Error("Timeout waiting for model initialization"));
         } else {
            setTimeout(checkInitialization, 50);
         }
      };

      checkInitialization();
   });
}

// Registrar todos los pasos de inicialización
export function registerBootstrapSteps() {
   // Paso 1: Inicializar configuración
   bootstrapManager.registerStep({
      name: "settings",
      initialize: async () => {
         // Esperar a que settingsModel complete su inicialización
         await waitForModelInitialization(settingsModel);
      },
   });

   // Paso 2: Inicializar workspace (depende de settings)
   bootstrapManager.registerStep({
      name: "workspace",
      dependencies: ["settings"],
      initialize: async () => {
         // Ahora workspaceModel puede acceder a settings de forma segura
         const keepTabs = settingsController.get("keepTabs");

         if (keepTabs === false) {
            workspaceModel.resetToDefaults();
         }
      },
   });

   // Paso 3: Otros models que no tienen dependencias
   bootstrapManager.registerStep({
      name: "other-models",
      initialize: async () => {
         // Aquí puedes inicializar otros models que no tienen dependencias
         // Por ejemplo: notesModel, tagsModel, etc.
         console.log("Inicializando otros models...");
      },
   });
}
