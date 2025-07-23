import { LocalStorageAdapter } from "@infrastructure/persistence/LocalStorageAdapter.svelte";

interface SidebarState {
   isOpen: boolean;
   width: number | undefined;
}

export class SidebarRepository extends LocalStorageAdapter<SidebarState> {
   constructor() {
      super("Sidebar");
   }

   protected getDefaultData(): SidebarState {
      return {
         isOpen: true,
         width: undefined,
      };
   }

   get width() {
      return this.data.width;
   }
   set width(newValue: SidebarState["width"]) {
      this.data.width = newValue;
      this.save()
   }
   get isOpen() {
      return this.data.isOpen;
   }
   set isOpen(newValue: SidebarState["isOpen"]) {
      this.data.isOpen = newValue;
      this.save()
   }
}
