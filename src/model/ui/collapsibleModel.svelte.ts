import { LocalStorageAdapter } from "@infrastructure/persistence/LocalStorageAdapter.svelte";

type CollapsibleStates = {
   [key: string]: boolean;
};

export class CollapsibleModel extends LocalStorageAdapter<CollapsibleStates> {
   constructor() {
      super("collapsible-states");
   }

   protected getDefaultData(): CollapsibleStates {
      return {};
   }

   // Métodos específicos para este modelo
   public toggle(key: string): void {
      this.data[key] = !this.data[key];
   }

   public isCollapsed(key: string): boolean {
      return this.data[key] ?? false;
   }

   public setCollapsed(key: string, collapsed: boolean): void {
      this.data[key] = collapsed;
   }
}
