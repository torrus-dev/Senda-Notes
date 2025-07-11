// bootstrap/bootstrapManager.svelte.ts
export interface BootstrapStep {
   name: string;
   initialize: () => Promise<void>;
   dependencies?: string[];
}

class BootstrapManager {
   private steps: Map<string, BootstrapStep> = new Map();
   private completedSteps: Set<string> = new Set();
   private isInitialized = $state(false);
   private currentStep = $state<string>("");
   private progress = $state(0);

   // Registra un paso de inicialización
   registerStep(step: BootstrapStep) {
      this.steps.set(step.name, step);
   }

   // Ejecuta todos los pasos respetando dependencias
   async initialize(): Promise<void> {
      const totalSteps = this.steps.size;
      let completedCount = 0;

      // Ejecutar pasos en orden de dependencias
      while (this.completedSteps.size < totalSteps) {
         const readySteps = this.getReadySteps();

         if (readySteps.length === 0) {
            throw new Error(
               "Dependencias circulares detectadas o paso faltante",
            );
         }

         // Ejecutar el primer paso disponible
         const step = readySteps[0];
         this.currentStep = step.name;

         try {
            await step.initialize();
            this.completedSteps.add(step.name);
            completedCount++;
            this.progress = Math.round((completedCount / totalSteps) * 100);
         } catch (error) {
            throw new Error(`Error inicializando ${step.name}: ${error}`);
         }
      }

      this.isInitialized = true;
      this.currentStep = "";
   }

   // Obtiene los pasos que están listos para ejecutar
   private getReadySteps(): BootstrapStep[] {
      const ready: BootstrapStep[] = [];

      for (const [name, step] of this.steps) {
         if (this.completedSteps.has(name)) continue;

         const dependenciesReady =
            step.dependencies?.every((dep) => this.completedSteps.has(dep)) ??
            true;

         if (dependenciesReady) {
            ready.push(step);
         }
      }

      return ready;
   }

   // Getters para el estado
   get initialized() {
      return this.isInitialized;
   }
   get current() {
      return this.currentStep;
   }
   get progressPercent() {
      return this.progress;
   }
}

export const bootstrapManager = $state(new BootstrapManager());
