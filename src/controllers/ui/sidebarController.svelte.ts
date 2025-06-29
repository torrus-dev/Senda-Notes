import { sidebarModel } from "@model/ui/sidebarModel.svelte";

class SidebarController {
   set width(newWidth: number) {
      if (typeof newWidth === "number") {
         sidebarModel.data.width = newWidth;
      }
   }

   get width(): number | null {
      return sidebarModel.data.width;
   }

   toggle() {
      sidebarModel.data.isOpen = !sidebarModel.data.isOpen;
   }

   close() {
      sidebarModel.data.isOpen = false;
   }

   open() {
      sidebarModel.data.isOpen = true;
   }

   get isOpen() {
      return sidebarModel.data.isOpen;
   }
}

export const sidebarController = $state(new SidebarController());
