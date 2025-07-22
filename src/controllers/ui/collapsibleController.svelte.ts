import { CollapsibleRepository } from "@infrastructure/repositories/core/CollapsibleRepository";
import { startupManager } from "@infrastructure/startup/startupManager.svelte";


class CollapsibleController {
   private get collapsibleRepository(): CollapsibleRepository {
      return startupManager.getService("collapsibleRepository");
   }

   register(id: string, defaultCollapsed: boolean = false): boolean {
      // Si ya existe, devolver su estado actual
      if (id in this.collapsibleRepository.data) {
         return this.collapsibleRepository.data[id];
      }

      // Si no existe, usar el valor por defecto
      this.collapsibleRepository.data[id] = defaultCollapsed;
      return defaultCollapsed;
   }

   /**
    * Obtiene el estado actual de un collapsible
    */
   getState(id: string): boolean {
      return this.collapsibleRepository.data[id] ?? false;
   }

   /**
    * Cambia el estado de un collapsible específico
    */
   toggle(id: string): void {
      if (!(id in this.collapsibleRepository.data)) {
         console.warn(`Collapsible with id "${id}" is not registered`);
         return;
      }

      this.collapsibleRepository.data[id] =
         !this.collapsibleRepository.data[id];
   }

   /**
    * Establece el estado de un collapsible específico
    */
   setState(id: string, collapsed: boolean): void {
      if (!(id in this.collapsibleRepository.data)) {
         console.warn(`Collapsible with id "${id}" is not registered`);
         return;
      }

      this.collapsibleRepository.data[id] = collapsed;
   }

   /**
    * Resetea el estado de un collapsible específico
    */
   reset(id: string, defaultState: boolean = false): void {
      this.collapsibleRepository.data[id] = defaultState;
   }

   /**
    * Obtiene todos los IDs registrados
    */
   getRegisteredIds(): string[] {
      return Object.keys(this.collapsibleRepository.data);
   }
}

export const collapsibleController = new CollapsibleController();
