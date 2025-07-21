import { WorkspaceModel } from "@model/navigation/workspaceModel.svelte";
import { CollapsibleModel } from "@model/ui/collapsibleModel.svelte";

// Nueva arquitectura
import { NoteRepository } from "@infrastructure/repositories/core/NoteRepository";
import { NoteQueryRepository } from "@infrastructure/repositories/core/NoteQueryRepository";
import { FavoritesRepository } from "@infrastructure/repositories/core/FavoritesRepository";
import { GlobalPropertyRepository } from "@infrastructure/repositories/core/GlobalPropertyRepository";
import { SidebarRepository } from "@infrastructure/repositories/ui/SidebarRepository";

import { NoteUseCases } from "@application/usecases/NoteUseCases";
import { FavoritesUseCases } from "@application/usecases/FavoritesUseCases";
import { NoteTreeService } from "@domain/services/NoteTreeService";
import { NotePathService } from "@domain/services/NotePathService";
import { PropertyService } from "@domain/services/PropertyService";
import { PropertyUseCases } from "@application/usecases/PropertyUseCases";
import { SearchService } from "@domain/services/SearchService";
import { SettingsRepository } from "@infrastructure/repositories/core/SettingsRepository";

// Tipos para los modelos (ya no incluye globalPropertiesModel)
interface Models {
   workspaceModel: WorkspaceModel;
   collapsibleModel: CollapsibleModel;
}

// Tipos para los servicios
interface Services {
   noteRepository: NoteRepository;
   noteQueryRepository: NoteQueryRepository;
   favoritesRepository: FavoritesRepository;
   sidebarRepository: SidebarRepository;
   settingsRepository: SettingsRepository;
   noteUseCases: NoteUseCases;
   searchService: SearchService;
   favoritesUseCases: FavoritesUseCases;
   noteTreeService: NoteTreeService;
   notePathService: NotePathService;
   globalPropertyRepository: GlobalPropertyRepository;
   propertyService: PropertyService;
   propertyUseCases: PropertyUseCases;
}

interface StartupStep {
   name: string;
   initialize: () => Promise<void>;
}

class StartupManager {
   public isReady = $state(false);
   public currentStep = $state<string>("");
   public progress = $state(0);
   public error = $state<string | null>(null);
   public models = {} as Models;
   public services = {} as Services;

   private async setupSteps() {
      const steps: StartupStep[] = [
         {
            name: "Inicializando configuración...",
            initialize: async () => {
               this.services.settingsRepository = new SettingsRepository();
               await this.services.settingsRepository.initialize();
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
            name: "Inicializando repositorios de favoritos...",
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
            },
         },
         {
            name: "Inicializando repositorios de propiedades...",
            initialize: async () => {
               this.services.globalPropertyRepository =
                  new GlobalPropertyRepository();
               await this.services.globalPropertyRepository.initialize();
            },
         },
         {
            name: "Inicializando repositorios de sidebar...",
            initialize: async () => {
               this.services.sidebarRepository = new SidebarRepository();
               await this.services.sidebarRepository.initialize();
            },
         },
         {
            name: "Inicializando servicios de dominio...",
            initialize: async () => {
               this.services.noteTreeService = new NoteTreeService();
               this.services.notePathService = new NotePathService();
               this.services.propertyService = new PropertyService();
               this.services.searchService = new SearchService();
            },
         },
         {
            name: "Inicializando casos de uso...",
            initialize: async () => {
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

               // Casos de uso de propiedades
               this.services.propertyUseCases = new PropertyUseCases(
                  this.services.propertyService,
                  this.services.globalPropertyRepository,
                  this.services.noteRepository,
                  this.services.noteQueryRepository,
               );
            },
         },
         {
            name: "Validando integridad del sistema...",
            initialize: async () => {
               // Validar integridad de propiedades al inicio
               try {
                  const integrityResult =
                     await this.services.propertyUseCases.validateIntegrity(
                        true,
                     );
                  if (!integrityResult.isValid) {
                     console.warn(
                        "Problemas de integridad detectados y reparados:",
                        integrityResult.issues,
                     );
                  }
               } catch (error) {
                  console.warn(
                     "Error durante validación de integridad:",
                     error,
                  );
                  // No fallar el inicio por problemas de integridad
               }
            },
         },
         {
            name: "Cargando colapsables...",
            initialize: async () => {
               this.models.collapsibleModel = new CollapsibleModel();
               await this.models.collapsibleModel.initialize();
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
         console.log(
            "✅ APLICACIÓN LISTA - Sistema de propiedades migrado exitosamente",
         );
      } catch (error) {
         console.error("❌ Error durante el inicio de la aplicación:", error);
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
      this.models = {} as Models;
      this.services = {} as Services;

      await this.launchApp();
   }

   // Método tipado para obtener modelos
   public getModel<K extends keyof Models>(modelName: K): Models[K] {
      if (!this.isReady) {
         throw new Error(
            `StartupManager no está listo. Modelo ${modelName} no disponible.`,
         );
      }

      if (!this.models[modelName]) {
         throw new Error(`Modelo "${modelName}" no encontrado.`);
      }

      return this.models[modelName];
   }

   // Método tipado para obtener servicios
   public getService<K extends keyof Services>(serviceName: K): Services[K] {
      if (!this.isReady) {
         throw new Error(
            `StartupManager no está listo. Servicio ${serviceName} no disponible.`,
         );
      }

      if (!this.services[serviceName]) {
         throw new Error(`Servicio "${serviceName}" no encontrado.`);
      }

      return this.services[serviceName];
   }
}

export const startupManager = new StartupManager();
