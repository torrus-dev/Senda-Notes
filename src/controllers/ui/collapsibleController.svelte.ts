import { collapsibleModal } from "modal/ui/collapsibleModal.svelte";

class CollapsibleController {
   register(id: string, defaultCollapsed: boolean = false): boolean {
      // Si ya existe, devolver su estado actual
      if (id in collapsibleModal.states) {
         return collapsibleModal.states[id];
      }

      // Si no existe, usar el valor por defecto
      collapsibleModal.states[id] = defaultCollapsed;
      return defaultCollapsed;
   }

   /**
    * Obtiene el estado actual de un collapsible
    */
   getState(id: string): boolean {
      return collapsibleModal.states[id] ?? false;
   }

   /**
    * Cambia el estado de un collapsible específico
    */
   toggle(id: string): void {
      if (!(id in collapsibleModal.states)) {
         console.warn(`Collapsible with id "${id}" is not registered`);
         return;
      }

      collapsibleModal.states[id] = !collapsibleModal.states[id];
   }

   /**
    * Establece el estado de un collapsible específico
    */
   setState(id: string, collapsed: boolean): void {
      if (!(id in collapsibleModal.states)) {
         console.warn(`Collapsible with id "${id}" is not registered`);
         return;
      }

      collapsibleModal.states[id] = collapsed;
   }

   /**
    * Resetea el estado de un collapsible específico
    */
   reset(id: string, defaultState: boolean = false): void {
      collapsibleModal.states[id] = defaultState;
   }

   /**
    * Obtiene todos los IDs registrados
    */
   getRegisteredIds(): string[] {
      return Object.keys(collapsibleModal.states);
   }
}

export const collapsibleController = new CollapsibleController();
