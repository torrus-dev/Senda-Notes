import { floatingMenuController } from "@controllers/floatingMenuController.svelte";
import type { MenuItem } from "@projectTypes/editorMenuTypes";
import type { Coordinates } from "@projectTypes/floatingMenuTypes";

function checkValid(menuItems: MenuItem[]) {
   if (menuItems && Array.isArray(menuItems) && menuItems.length > 0) {
      return true;
   }
   return false;
}

// Directiva para abrir el menú como context menu (con clic derecho)
export function contextMenu(node: HTMLElement, menuItems: MenuItem[]) {
   if (!checkValid(menuItems)) {
      console.warn("Invalid menu items provided to contextMenu directive!");
      return {
         update() {},
         destroy() {},
      };
   }

   function handleContextMenu(event: MouseEvent) {
      event.preventDefault();
      event.stopPropagation();

      // Cerrar cualquier menú abierto antes de abrir uno nuevo
      floatingMenuController.closeMenu();

      // Abrir nuestro menú contextual personalizado
      const coordinates: Coordinates = { x: event.clientX, y: event.clientY };
      floatingMenuController.openContextMenu(coordinates, menuItems);
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
   if (!checkValid(menuItems)) {
      console.warn("Invalid menu items provided to dropdownMenu directive!");
      return {
         update() {},
         destroy() {},
      };
   }

   function handleClick(event: MouseEvent) {
      event.preventDefault();
      event.stopPropagation();

      // Cerrar cualquier menú abierto antes de abrir uno nuevo
      floatingMenuController.closeMenu();

      // Usar el nuevo método unificado para abrir el menú dropdown
      floatingMenuController.openDropdownMenu(node, menuItems);
   }

   // Añadir el event listener
   node.addEventListener("click", handleClick);

   return {
      // Actualizar las opciones si cambian
      update(newMenuItems: MenuItem[]) {
         const wasValid = checkValid(menuItems);
         const isValid = checkValid(newMenuItems);
         menuItems = newMenuItems;

         if (wasValid && !isValid) {
            node.removeEventListener("click", handleClick);
         } else if (!wasValid && isValid) {
            node.addEventListener("click", handleClick);
         }
      },
      destroy() {
         node.removeEventListener("click", handleClick);
      },
   };
}
