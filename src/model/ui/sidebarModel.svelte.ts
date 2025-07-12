import { PersistentLocalStorageModel } from "@model/persistentLocalStorageModel.svelte";

interface SidebarState {
   isOpen: boolean;
   width: number | null;
}

class SidebarModel extends PersistentLocalStorageModel<SidebarState> {
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

export const sidebarModel = $state(new SidebarModel());
