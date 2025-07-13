import { GlobalPropertiesModel } from "@model/application/globalPropertiesModel.svelte";
import { SettingsModel } from "@model/application/settingsModel.svelte";
import { WorkspaceModel } from "@model/navigation/workspaceModel.svelte";
import { FavoritesModel } from "@model/notes/favoritesModel.svelte";
import { NoteModel } from "@model/notes/noteModel.svelte";
import { CollapsibleModel } from "@model/ui/collapsibleModel.svelte";
import { SidebarModel } from "@model/ui/sidebarModel.svelte";

interface StartupStep {
   name: string;
   initialize: () => Promise<void>;
}

class StartupManager {
   public isReady = $state(false);
   public currentStep = $state<string>("");
   public progress = $state(0);
   public error = $state<string | null>(null);
   public models: Record<string, any> = {};

   private async setupSteps() {

      const steps: StartupStep[] = [
         {
            name: "Inicializando configuración...",
            initialize: async () => {
               this.models.settingsModel = new SettingsModel();
               await this.models.settingsModel.initialize();
            },
         },
         {
            name: "Cargando espacio de trabajo...",
            initialize: async () => {
               this.models.workspaceModel = new WorkspaceModel();
               await this.models.workspaceModel.initialize();
            },
         },
         {
            name: "Cargando propiedades globales...",
            initialize: async () => {
               this.models.globalPropertiesModel = new GlobalPropertiesModel();
               await this.models.globalPropertiesModel.initialize();
            },
         },
         {
            name: "Cargando favoritos...",
            initialize: async () => {
               this.models.favoritesModel = new FavoritesModel();
               await this.models.favoritesModel.initialize();
            },
         },
         {
            name: "Cargando notas...",
            initialize: async () => {
               this.models.noteModel = new NoteModel();
               await this.models.noteModel.initialize();
            },
         },
         {
            name: "Cargando colapsables...",
            initialize: async () => {
               this.models.collapsibleModel = new CollapsibleModel();
               await this.models.collapsibleModel.initialize();
            },
         },
         {
            name: "Cargando sidebar...",
            initialize: async () => {
               this.models.sidebarModel = new SidebarModel();
               await this.models.sidebarModel.initialize();
            },
         },
      ];
      return steps;
   }

   public async launchApp(): Promise<void> {
      if (this.isReady) return;

      this.error = null;
      this.progress = 0;

      try {
         const steps = await this.setupSteps();

         for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            this.currentStep = step.name;

            await step.initialize();
            this.progress = ((i + 1) / steps.length) * 100;

            // Pequeña pausa para mostrar el progreso
            await new Promise((resolve) => setTimeout(resolve, 100));
         }

         this.currentStep = "Aplicación lista";
         this.isReady = true;
         console.log("APLICACIÓN LISTA");
      } catch (error) {
         console.error("Error durante el inicio de la aplicación:", error);
         this.error = `Error durante la inicialización: ${error}`;
         this.isReady = false;
      }
   }

   // Método para resetear y reinicializar
   public async restart(): Promise<void> {
      this.isReady = false;
      this.currentStep = "";
      this.progress = 0;
      this.error = null;
      this.models = {};

      await this.launchApp();
   }
   // Método genérico para obtener cualquier modelo
   public getModel<T>(modelName: string): T {
      if (!this.isReady) {
         throw new Error(
            `StartupManager no está listo. modelo ${modelName} no disponible.`,
         );
      }

      if (!this.models[modelName]) {
         throw new Error(`Modelo "${modelName}" no encontrado.`);
      }

      return this.models[modelName] as T;
   }
}

export const startupManager = new StartupManager();

// export const settingsModel = $derived(startupManager.settingsModel);
// export const workspaceModel = $derived(startupManager.workspaceModel);
// export const noteModel = $derived(startupManager.noteModel);
// export const globalPropertiesModel = $derived(
//    startupManager.globalPropertiesModel,
// );
// export const favoritesModel = $derived(startupManager.favoritesModel);
// export const collapsibleModel = $derived(startupManager.collapsibleModel);
// export const sidebarModel = $derived(startupManager.sidebarModel);
