import { startupManager } from "@model/startup/startupManager.svelte";
import { SidebarModel } from "@model/ui/sidebarModel.svelte";

class SidebarController {
   private get sidebarModel(): SidebarModel {
      return startupManager.getModel("sidebarModel");
   }
   set width(newWidth: number) {
      if (typeof newWidth === "number") {
         this.sidebarModel.data.width = newWidth;
      }
   }

   get width(): number | null {
      return this.sidebarModel.data.width;
   }

   toggle() {
      this.sidebarModel.data.isOpen = !this.sidebarModel.data.isOpen;
   }

   close() {
      this.sidebarModel.data.isOpen = false;
   }

   open() {
      this.sidebarModel.data.isOpen = true;
   }

   get isOpen() {
      return this.sidebarModel.data.isOpen;
   }
}

export const sidebarController = $state(new SidebarController());
