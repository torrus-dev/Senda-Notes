import { PersistentLocalStorageModel } from "@model/persistentLocalStorageModel.svelte";

interface SidebarState {
   isOpen: boolean;
   width: number | null;
}

export class SidebarModel extends PersistentLocalStorageModel<SidebarState> {
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
