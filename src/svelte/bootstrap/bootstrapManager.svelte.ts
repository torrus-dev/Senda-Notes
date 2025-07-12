// bootstrapManager.svelte.ts
import { settingsModel } from "@model/application/settingsModel.svelte";
import { workspaceModel } from "@model/navigation/workspaceModel.svelte";

export type BootstrapPhase = "loading" | "ready" | "error";

interface BootstrapState {
   phase: BootstrapPhase;
   progress: number;
   currentStep: string;
   error?: string;
}

class BootstrapManager {
   private state: BootstrapState = $state({
      phase: "loading",
      progress: 0,
      currentStep: "Inicializando...",
      error: undefined,
   });

   // Getters públicos para acceder al estado
   get phase(): BootstrapPhase {
      return this.state.phase;
   }

   get progress(): number {
      return this.state.progress;
   }

   get currentStep(): string {
      return this.state.currentStep;
   }

   get error(): string | undefined {
      return this.state.error;
   }

   get isReady(): boolean {
      return this.state.phase === "ready";
   }

   async initialize(): Promise<void> {
      try {
         this.state.phase = "loading";
         this.state.error = undefined;

         // Paso 1: Cargar configuración
         this.updateProgress(20, "Cargando configuración...");
         console.log("Bootstrap: Forzando inicialización de settingsModel...");

         // En lugar de esperar, vamos a forzar la inicialización
         await this.forceModelInitialization(settingsModel);
         console.log("Bootstrap: settingsModel inicializado");

         // Paso 2: Inicializar workspace (ahora que settings está listo)
         this.updateProgress(60, "Inicializando espacio de trabajo...");
         console.log("Bootstrap: Inicializando workspace...");
         await this.initializeWorkspace();
         console.log("Bootstrap: workspace inicializado");

         // Paso 3: Otros models futuros irían aquí
         this.updateProgress(80, "Finalizando inicialización...");

         // Pequeña pausa para mostrar el progreso completo
         await this.delay(200);

         this.updateProgress(100, "Aplicación lista");
         this.state.phase = "ready";
         console.log("Bootstrap: Inicialización completada");
      } catch (error) {
         console.error("Error durante la inicialización:", error);
         this.state.phase = "error";
         this.state.error =
            error instanceof Error ? error.message : "Error desconocido";
      }
   }

   private async forceModelInitialization(model: any): Promise<void> {
      console.log("Bootstrap: Forzando inicialización del model...");

      try {
         // Si el model tiene un método initialize, usarlo (versión mejorada)
         if (typeof model.initialize === "function") {
            console.log("Bootstrap: Llamando initialize del model...");
            await model.initialize();
            return;
         }

         // Si el model tiene un método de reload, usarlo
         if (typeof model.reload === "function") {
            console.log("Bootstrap: Llamando reload del model...");
            await model.reload();
         }

         // Si el model tiene un método de inicialización específico, llamarlo
         if (typeof model.initializeData === "function") {
            console.log("Bootstrap: Llamando initializeData del model...");
            await model.initializeData();
         }

         // Esperar un poco para que se procese
         await this.delay(100);

         // Verificar si se inicializó
         if (!model.isInitialized) {
            console.warn(
               "Bootstrap: Model no se inicializó automáticamente, marcando como inicializado",
            );
            // Como último recurso, marcar como inicializado manualmente
            if (model.hasOwnProperty("isInitialized")) {
               model.isInitialized = true;
            }
         }

         console.log("Bootstrap: Model forzado a inicializarse");
      } catch (error) {
         console.error("Bootstrap: Error forzando inicialización:", error);
         throw error;
      }
   }

   private async initializeWorkspace(): Promise<void> {
      // Reinicializar workspace con la configuración cargada
      workspaceModel.reinitializeWithSettings();
      await this.delay(100); // Simular tiempo de procesamiento
   }

   private updateProgress(progress: number, step: string): void {
      this.state.progress = progress;
      this.state.currentStep = step;
   }

   private delay(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
   }

   // Método para reiniciar la aplicación
   async restart(): Promise<void> {
      await this.initialize();
   }
}

export const bootstrapManager = $state(new BootstrapManager());
