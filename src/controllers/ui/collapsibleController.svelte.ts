import { collapsibleModel } from "@model/ui/collapsibleModel.svelte";

class CollapsibleController {
   register(id: string, defaultCollapsed: boolean = false): boolean {
      // Si ya existe, devolver su estado actual
      if (id in collapsibleModel.data) {
         return collapsibleModel.data[id];
      }

      // Si no existe, usar el valor por defecto
      collapsibleModel.data[id] = defaultCollapsed;
      return defaultCollapsed;
   }

   /**
    * Obtiene el estado actual de un collapsible
    */
   getState(id: string): boolean {
      return collapsibleModel.data[id] ?? false;
   }

   /**
    * Cambia el estado de un collapsible específico
    */
   toggle(id: string): void {
      if (!(id in collapsibleModel.data)) {
         console.warn(`Collapsible with id "${id}" is not registered`);
         return;
      }

      collapsibleModel.data[id] = !collapsibleModel.data[id];
   }

   /**
    * Establece el estado de un collapsible específico
    */
   setState(id: string, collapsed: boolean): void {
      if (!(id in collapsibleModel.data)) {
         console.warn(`Collapsible with id "${id}" is not registered`);
         return;
      }

      collapsibleModel.data[id] = collapsed;
   }

   /**
    * Resetea el estado de un collapsible específico
    */
   reset(id: string, defaultState: boolean = false): void {
      collapsibleModel.data[id] = defaultState;
   }

   /**
    * Obtiene todos los IDs registrados
    */
   getRegisteredIds(): string[] {
      return Object.keys(collapsibleModel.data);
   }
}

export const collapsibleController = new CollapsibleController();
