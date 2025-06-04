import { floatingMenuController } from "@controllers/menu/floatingMenuController.svelte";
import type { MenuItem } from "@projectTypes/editorMenuTypes";
import type { Coordinates } from "@projectTypes/floatingTypes";

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
   let { menuItems, leftClickDisabled, rightClickDisabled } = params;

   // Si no hay menuItems, devolver un objeto de directiva "noop"
   if (!checkValid(menuItems)) {
      return {
         update() {},
         destroy() {},
      };
   }

   function handleClick(event: MouseEvent) {
      if (leftClickDisabled) return;
      event.preventDefault();
      event.stopPropagation();

      const triggerElement = floatingMenuController.getTriggerElement();

      if (menuItems && !(triggerElement === node)) {
         floatingMenuController.openDropdownMenu(node, menuItems);
      } else {
         floatingMenuController.closeMenu();
      }
   }

   function handleContextMenu(event: MouseEvent) {
      if (rightClickDisabled) return; // Solo procesar si está habilitado el clic derecho

      event.preventDefault();
      event.stopPropagation();

      const triggerElement = floatingMenuController.getTriggerElement();

      if (menuItems && !(triggerElement === node)) {
         floatingMenuController.openDropdownMenu(node, menuItems);
      } else {
         floatingMenuController.closeMenu();
      }
   }

   // Añadir los event listeners
   node.addEventListener("click", handleClick);
   node.addEventListener("contextmenu", handleContextMenu);

   return {
      // Actualizar las opciones si cambian
      update(newParams: {
         newMenuItems: MenuItem[] | undefined;
         leftClickDisabled?: boolean;
         rightClickDisabled?: boolean;
      }) {
         const { newMenuItems, leftClickDisabled, rightClickDisabled } =
            newParams;

         const wasValid = checkValid(menuItems);
         const isValid = checkValid(newMenuItems);
         menuItems = newMenuItems;

         if (wasValid && !isValid) {
            node.removeEventListener("click", handleClick);
            node.removeEventListener("contextmenu", handleContextMenu);
         } else if (!wasValid && isValid) {
            node.addEventListener("click", handleClick);
            node.addEventListener("contextmenu", handleContextMenu);
         }
      },
      destroy() {
         node.removeEventListener("click", handleClick);
         node.removeEventListener("contextmenu", handleContextMenu);
      },
   };
}
