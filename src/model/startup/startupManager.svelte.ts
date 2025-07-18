import { GlobalPropertiesModel } from "@model/application/globalPropertiesModel.svelte";
import { SettingsModel } from "@model/application/settingsModel.svelte";
import { WorkspaceModel } from "@model/navigation/workspaceModel.svelte";
import { CollapsibleModel } from "@model/ui/collapsibleModel.svelte";
import { SidebarModel } from "@model/ui/sidebarModel.svelte";

// Nueva arquitectura
import { NoteRepository } from "@infrastructure/NoteRepository";
import { NoteQueryRepository } from "@infrastructure/NoteQueryRepository";
import { FavoritesRepository } from "@infrastructure/FavoritesRepository";
import { NoteUseCases } from "@application/NoteUseCases";
import { FavoritesUseCases } from "@application/FavoritesUseCases";
import { NoteTreeService } from "@domain/NoteTreeService";
import { NotePathService } from "@domain/NotePathService";

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
   public services: Record<string, any> = {};

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
               this.services.favoritesRepository = new FavoritesRepository();
               await this.services.favoritesRepository.initialize();
            },
         },
         {
            name: "Inicializando repositorios de notas...",
            initialize: async () => {
               // Repositorios
               this.services.noteRepository = new NoteRepository();
               await this.services.noteRepository.initialize();

               this.services.noteQueryRepository = new NoteQueryRepository(
                  this.services.noteRepository,
               );

               // Servicios de dominio
               this.services.noteTreeService = new NoteTreeService();
               this.services.notePathService = new NotePathService();

               // Casos de uso de favoritos
               this.services.favoritesUseCases = new FavoritesUseCases(
                  this.services.favoritesRepository,
               );

               // Casos de uso de notas
               this.services.noteUseCases = new NoteUseCases(
                  this.services.noteRepository,
                  this.services.noteQueryRepository,
                  this.services.favoritesUseCases,
               );
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
      this.services = {};

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

   // Nuevo método para obtener servicios
   public getService<T>(serviceName: string): T {
      if (!this.isReady) {
         throw new Error(
            `StartupManager no está listo. servicio ${serviceName} no disponible.`,
         );
      }

      if (!this.services[serviceName]) {
         throw new Error(`Servicio "${serviceName}" no encontrado.`);
      }

      return this.services[serviceName] as T;
   }
}

export const startupManager = new StartupManager();
