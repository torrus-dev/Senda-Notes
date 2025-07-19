import { startupManager } from "@infrastructure/startup/startupManager.svelte";
import { CollapsibleModel } from "@model/ui/collapsibleModel.svelte";

class CollapsibleController {
   private get collapsibleModel(): CollapsibleModel {
      return startupManager.getModel("collapsibleModel");
   }

   register(id: string, defaultCollapsed: boolean = false): boolean {
      // Si ya existe, devolver su estado actual
      if (id in this.collapsibleModel.data) {
         return this.collapsibleModel.data[id];
      }

      // Si no existe, usar el valor por defecto
      this.collapsibleModel.data[id] = defaultCollapsed;
      return defaultCollapsed;
   }

   /**
    * Obtiene el estado actual de un collapsible
    */
   getState(id: string): boolean {
      return this.collapsibleModel.data[id] ?? false;
   }

   /**
    * Cambia el estado de un collapsible específico
    */
   toggle(id: string): void {
      if (!(id in this.collapsibleModel.data)) {
         console.warn(`Collapsible with id "${id}" is not registered`);
         return;
      }

      this.collapsibleModel.data[id] = !this.collapsibleModel.data[id];
   }

   /**
    * Establece el estado de un collapsible específico
    */
   setState(id: string, collapsed: boolean): void {
      if (!(id in this.collapsibleModel.data)) {
         console.warn(`Collapsible with id "${id}" is not registered`);
         return;
      }

      this.collapsibleModel.data[id] = collapsed;
   }

   /**
    * Resetea el estado de un collapsible específico
    */
   reset(id: string, defaultState: boolean = false): void {
      this.collapsibleModel.data[id] = defaultState;
   }

   /**
    * Obtiene todos los IDs registrados
    */
   getRegisteredIds(): string[] {
      return Object.keys(this.collapsibleModel.data);
   }
}

export const collapsibleController = new CollapsibleController();
