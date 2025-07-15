import { floatingMenuController } from "@controllers/menu/floatingMenuController.svelte";
import type { Coordinates, MenuItem } from "@projectTypes/ui/contextMenuTypes";

function checkValid(menuItems: MenuItem[] | undefined) {
   if (menuItems && Array.isArray(menuItems) && menuItems.length > 0) {
      return true;
   }
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

// Directiva para abrir el menú como dropdown (anclado a un elemento)
export function dropdownMenu(
   node: HTMLElement,
   params: {
      menuItems: MenuItem[] | undefined;
      leftClickDisabled?: boolean;
      rightClickDisabled?: boolean;
   },
) {
   let {
      menuItems,
      leftClickDisabled = false,
      rightClickDisabled = false,
   } = params;
   let isDestroyed = false;

   // Si no hay menuItems, devolver un objeto de directiva "noop"
   if (!checkValid(menuItems)) {
      return {
         update() {},
         destroy() {},
      };
   }

   function handleClick(event: MouseEvent) {
      if (isDestroyed || leftClickDisabled) return;
      event.preventDefault();
      event.stopPropagation();

      const triggerElement = floatingMenuController.getTriggerElement();

      if (menuItems && checkValid(menuItems) && !(triggerElement === node)) {
         floatingMenuController.openDropdownMenu(node, menuItems);
      } else {
         floatingMenuController.closeMenu();
      }
   }

   function handleContextMenu(event: MouseEvent) {
      if (isDestroyed || rightClickDisabled) return;

      event.preventDefault();
      event.stopPropagation();

      const triggerElement = floatingMenuController.getTriggerElement();

      if (menuItems && checkValid(menuItems) && !(triggerElement === node)) {
         floatingMenuController.openDropdownMenu(node, menuItems);
      } else {
         floatingMenuController.closeMenu();
      }
   }

   // Añadir los event listeners
   node.addEventListener("click", handleClick);
   node.addEventListener("contextmenu", handleContextMenu);

   return {
      update(newParams: {
         menuItems: MenuItem[] | undefined;
         leftClickDisabled?: boolean;
         rightClickDisabled?: boolean;
      }) {
         const wasValid = checkValid(menuItems);

         menuItems = newParams.menuItems;
         leftClickDisabled = newParams.leftClickDisabled ?? false;
         rightClickDisabled = newParams.rightClickDisabled ?? false;

         const isValid = checkValid(menuItems);

         if (wasValid && !isValid) {
            node.removeEventListener("click", handleClick);
            node.removeEventListener("contextmenu", handleContextMenu);
         } else if (!wasValid && isValid) {
            node.addEventListener("click", handleClick);
            node.addEventListener("contextmenu", handleContextMenu);
         }
      },
      destroy() {
         isDestroyed = true;
         node.removeEventListener("click", handleClick);
         node.removeEventListener("contextmenu", handleContextMenu);
      },
   };
}
