import { floatingMenuController } from "@controllers/floatingMenuController.svelte";
import type { MenuItem } from "@projectTypes/editorMenuTypes";
import type { Coordinates } from "@projectTypes/floatingTypes";

function checkValid(menuItems: MenuItem[] | undefined) {
   if (menuItems && Array.isArray(menuItems) && menuItems.length > 0) {
      return true;
   }
   console.warn("menu items are invalid", menuItems);
   return false;
}

// Directiva para abrir el menú como context menu (con clic derecho)
export function contextMenu(
   node: HTMLElement,
   menuItems: MenuItem[] | undefined,
) {
   // Si no hay menuItems, devolver un objeto de directiva "noop" (no operation)
   if (!checkValid(menuItems)) {
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
      if (menuItems) {
         floatingMenuController.openContextMenu(coordinates, menuItems);
      }
   }

   // Añadir el event listener
   node.addEventListener("contextmenu", handleContextMenu);

   return {
      // Actualizar las opciones si cambian
      update(newMenuItems: MenuItem[] | undefined) {
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
      destroy() {
         // Limpiar event listeners al destruir el componente
         node.removeEventListener("contextmenu", handleContextMenu);
      },
   };
}

// Directiva para abrir el menú como dropdown (con clic normal)
export function dropdownMenu(
   node: HTMLElement,
   menuItems: MenuItem[] | undefined,
) {
   // Si no hay menuItems, devolver un objeto de directiva "noop"
   if (!checkValid(menuItems)) {
      return {
         update() {},
         destroy() {},
      };
   }

   function handleClick(event: MouseEvent) {
      event.preventDefault();
      event.stopPropagation();

      const triggerElement = floatingMenuController.getTriggerElement();

      if (menuItems && !(triggerElement === node)) {
         floatingMenuController.openDropdownMenu(node, menuItems);
      } else {
         floatingMenuController.closeMenu();
      }
   }

   // Añadir el event listener
   node.addEventListener("click", handleClick);

   return {
      // Actualizar las opciones si cambian
      update(newMenuItems: MenuItem[] | undefined) {
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
