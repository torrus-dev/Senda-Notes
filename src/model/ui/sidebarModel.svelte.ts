import { LocalStorageAdapter } from "@infrastructure/persistence/LocalStorageAdapter.svelte";

interface SidebarState {
   isOpen: boolean;
   width: number | null;
}

export class SidebarModel extends LocalStorageAdapter<SidebarState> {
   constructor() {
      super("Sidebar");
   }

   protected getDefaultData(): SidebarState {
      return {
         isOpen: true,
         width: null,
      };
   }
}
