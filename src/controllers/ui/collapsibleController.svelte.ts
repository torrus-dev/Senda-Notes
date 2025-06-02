import { collapsibleModel } from "@model/ui/collapsibleModel.svelte";

class CollapsibleController {
   register(id: string, defaultCollapsed: boolean = false): boolean {
      // Si ya existe, devolver su estado actual
      if (id in collapsibleModel.states) {
         return collapsibleModel.states[id];
      }

      // Si no existe, usar el valor por defecto
      collapsibleModel.states[id] = defaultCollapsed;
      return defaultCollapsed;
   }

   /**
    * Obtiene el estado actual de un collapsible
    */
   getState(id: string): boolean {
      return collapsibleModel.states[id] ?? false;
   }

   /**
    * Cambia el estado de un collapsible específico
    */
   toggle(id: string): void {
      if (!(id in collapsibleModel.states)) {
         console.warn(`Collapsible with id "${id}" is not registered`);
         return;
      }

      collapsibleModel.states[id] = !collapsibleModel.states[id];
   }

   /**
    * Establece el estado de un collapsible específico
    */
   setState(id: string, collapsed: boolean): void {
      if (!(id in collapsibleModel.states)) {
         console.warn(`Collapsible with id "${id}" is not registered`);
         return;
      }

      collapsibleModel.states[id] = collapsed;
   }

   /**
    * Resetea el estado de un collapsible específico
    */
   reset(id: string, defaultState: boolean = false): void {
      collapsibleModel.states[id] = defaultState;
   }

   /**
    * Obtiene todos los IDs registrados
    */
   getRegisteredIds(): string[] {
      return Object.keys(collapsibleModel.states);
   }
}

export const collapsibleController = new CollapsibleController();
