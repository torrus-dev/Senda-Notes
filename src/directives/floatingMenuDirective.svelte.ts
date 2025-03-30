import { floatingMenuController } from "@controllers/floatingMenuController.svelte";
import { MenuItem } from "@projectTypes/contextMenuTypes";

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
   // Si no hay opciones válidas o options es undefined, no hacer nada
   if (!checkValid(menuItems)) {
      return {
         update() {},
         destroy() {},
      };
   }

   function handleContextMenu(event: MouseEvent) {
      event.preventDefault();
      event.stopPropagation();

      // Cerrar cualquier menú abierto previamente
      if (floatingMenuController.isOpen) {
         floatingMenuController.close();
      }

      // Abrir nuestro menú contextual personalizado
      floatingMenuController.openContextMenu(
         { x: event.clientX, y: event.clientY },
         menuItems,
      );
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
      // Si no hay opciones válidas o options es undefined, no hacer nada
      return {
         update() {},
         destroy() {},
      };
   }

   function handleClick(event: MouseEvent) {
      event.preventDefault();
      event.stopPropagation();

      if (floatingMenuController.isOpen) {
         floatingMenuController.close();
      } else {
         // Abrir el menú dropdown
         floatingMenuController.openDropdownMenu(node, menuItems);
      }
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
