import { sidebarModel } from "@model/ui/sidebarModel.svelte";

class SidebarController {
   setWidth = (newWidth: number) => {
      if (typeof newWidth === "number") {
         sidebarModel.width = newWidth;
      }
   };

   getWidth = () => {
      return sidebarModel.width;
   };

   toggle = () => {
      sidebarModel.isOpen = !sidebarModel.isOpen;
   };

   close = () => {
      sidebarModel.isOpen = false;
   };

   open = () => {
      sidebarModel.isOpen = true;
   };

   isOpen = () => {
      return sidebarModel.isOpen;
   };
}

export const sidebarController = $state(new SidebarController());
