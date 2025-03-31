import { contextMenuController } from "@controllers/contextMenuController.svelte";
import { Coordinates, MenuItem } from "@projectTypes/floatingMenuTypes";

function checkValid(menuItems: MenuItem[]) {
   if (menuItems && Array.isArray(menuItems) && menuItems.length > 0) {
      if (menuItems.length > 0) {
         return true;
      }
   }
   return false;
}

// Directiva para abrir el menú como context menu (con clic derecho)
export function contextMenu(node: HTMLElement, menuItems: MenuItem[]) {
   if (!checkValid(menuItems)) {
      console.warn("invalid menu items!");
      return {
         update() {},
         destroy() {},
      };
   }

   function handleContextMenu(event: MouseEvent) {
      event.preventDefault();
      event.stopPropagation();
      contextMenuController.close();

      // Abrir nuestro menú contextual personalizado
      const coordenates: Coordinates = { x: event.clientX, y: event.clientY };
      contextMenuController.openMenu(coordenates, menuItems);
   }

   // Añadir el event listener
   node.addEventListener("contextmenu", handleContextMenu);

   return {
      // Actualizar las opciones si cambian
      update(newMenuItems: MenuItem[]) {
         const wasValid = checkValid(menuItems);
         const isValid = checkValid(newMenuItems);
         menuItems = newMenuItems;

         // Si las opciones cambian a inválidas, remover el listener
         if (wasValid && !isValid) {
            node.removeEventListener("contextmenu", handleContextMenu);
         } else if (!wasValid && isValid) {
            // Si pasamos de opciones inválidas a válidas, añadir el listener
            node.addEventListener("contextmenu", handleContextMenu);
         }
      },
      // Limpiar event listeners al destruir el componente
      destroy() {
         node.removeEventListener("contextmenu", handleContextMenu);
      },
   };
}

// Directiva para abrir el menú como dropdown (con clic normal)
export function dropdownMenu(node: HTMLElement, menuItems: MenuItem[]) {
   if (!checkValid(menuItems) || true) {
      // Si no hay opciones válidas o options es undefined, no hacer nada
      return {
         update() {},
         destroy() {},
      };
   }

   function handleClick(event: MouseEvent) {
      event.preventDefault();
      event.stopPropagation();

      // if (contextMenuController.isOpen) {
      //    contextMenuController.close();
      // } else {
      //    // Abrir el menú dropdown
      //    contextMenuController.openDropdownMenu(node, menuItems);
      // }
   }

   node.addEventListener("click", handleClick);

   return {
      // Actualizar las opciones si cambian
      update(newMenuItems: MenuItem[]) {
         const wasValid = checkValid(menuItems);
         const isValid = checkValid(newMenuItems);
         menuItems = newMenuItems;

         // Si las opciones cambian a inválidas, remover el listener
         if (wasValid && !isValid) {
            node.removeEventListener("click", handleClick);
         } else if (!wasValid && isValid) {
            // Si pasamos de opciones inválidas a válidas, añadir el listener
            node.addEventListener("click", handleClick);
         }
      },
      // Limpiar event listeners al destruir el componente
      destroy() {
         node.removeEventListener("click", handleClick);
      },
   };
}
