import { SidebarRepository } from "@infrastructure/repositories/ui/SidebarRepository";
import { startupManager } from "@infrastructure/startup/startupManager.svelte";

class SidebarController {
   private get sidebarRepository(): SidebarRepository {
      return startupManager.getService("sidebarRepository");
   }

   set width(newWidth: number) {
      if (typeof newWidth === "number") {
         this.sidebarRepository.width = newWidth;
      }
   }

   get width(): number | undefined {
      return this.sidebarRepository.width;
   }

   toggle() {
      this.sidebarRepository.isOpen = !this.sidebarRepository.isOpen;
   }

   close() {
      this.sidebarRepository.isOpen = false;
   }

   open() {
      this.sidebarRepository.isOpen = true;
   }

   get isOpen() {
      return this.sidebarRepository.isOpen;
   }
}

export const sidebarController = $state(new SidebarController());
