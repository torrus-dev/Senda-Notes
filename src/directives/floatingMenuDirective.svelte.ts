import { floatingMenuController } from "@controllers/menu/FloatingMenuController.svelte";
import type { Coordinates, MenuItem } from "@projectTypes/ui/contextMenuTypes";

function isValidMenuItems(menuItems: MenuItem[] | undefined): boolean {
   return menuItems != null && Array.isArray(menuItems) && menuItems.length > 0;
}

// Directiva para abrir el menú como context menu (con clic derecho)
export function contextMenu(
   node: HTMLElement,
   menuItems: MenuItem[] | undefined,
) {
   let currentMenuItems = menuItems;
   let hasListener = false;

   // Si no hay menuItems, devolver un objeto de directiva "noop" (no operation)
   if (!isValidMenuItems(currentMenuItems)) {
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
      if (currentMenuItems) {
         floatingMenuController.openContextMenu(coordinates, currentMenuItems);
      }
   }

   // Añadir el event listener inicial
   node.addEventListener("contextmenu", handleContextMenu);
   hasListener = true;

   return {
      // Actualizar las opciones si cambian
      update(newMenuItems: MenuItem[] | undefined) {
         const wasValid = isValidMenuItems(currentMenuItems);
         const isValid = isValidMenuItems(newMenuItems);
         currentMenuItems = newMenuItems;

         // Si las opciones cambian a inválidas, remover el listener
         if (wasValid && !isValid && hasListener) {
            node.removeEventListener("contextmenu", handleContextMenu);
            hasListener = false;
         } else if (!wasValid && isValid && !hasListener) {
            // Si pasamos de opciones inválidas a válidas, añadir el listener
            node.addEventListener("contextmenu", handleContextMenu);
            hasListener = true;
         }
      },
      destroy() {
         // Limpiar event listeners al destruir el componente
         if (hasListener) {
            node.removeEventListener("contextmenu", handleContextMenu);
         }
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
   let hasListeners = false;

   // Si no hay menuItems, devolver un objeto de directiva "noop"
   if (!isValidMenuItems(menuItems)) {
      return {
         update() {},
         destroy() {},
      };
   }

   function handleMenuAction(event: MouseEvent) {
      if (isDestroyed) return;

      event.preventDefault();
      event.stopPropagation();

      const triggerElement = floatingMenuController.getTriggerElement();

      if (menuItems && isValidMenuItems(menuItems) && triggerElement !== node) {
         floatingMenuController.openDropdownMenu(node, menuItems);
      } else {
         floatingMenuController.closeMenu();
      }
   }

   function handleClick(event: MouseEvent) {
      if (leftClickDisabled) return;
      handleMenuAction(event);
   }

   function handleContextMenu(event: MouseEvent) {
      if (rightClickDisabled) return;
      handleMenuAction(event);
   }

   // Añadir los event listeners iniciales
   node.addEventListener("click", handleClick);
   node.addEventListener("contextmenu", handleContextMenu);
   hasListeners = true;

   return {
      update(newParams: {
         menuItems: MenuItem[] | undefined;
         leftClickDisabled?: boolean;
         rightClickDisabled?: boolean;
      }) {
         const wasValid = isValidMenuItems(menuItems);

         menuItems = newParams.menuItems;
         leftClickDisabled = newParams.leftClickDisabled ?? false;
         rightClickDisabled = newParams.rightClickDisabled ?? false;

         const isValid = isValidMenuItems(menuItems);

         if (wasValid && !isValid && hasListeners) {
            node.removeEventListener("click", handleClick);
            node.removeEventListener("contextmenu", handleContextMenu);
            hasListeners = false;
         } else if (!wasValid && isValid && !hasListeners) {
            node.addEventListener("click", handleClick);
            node.addEventListener("contextmenu", handleContextMenu);
            hasListeners = true;
         }
      },
      destroy() {
         isDestroyed = true;
         if (hasListeners) {
            node.removeEventListener("click", handleClick);
            node.removeEventListener("contextmenu", handleContextMenu);
         }
      },
   };
}
