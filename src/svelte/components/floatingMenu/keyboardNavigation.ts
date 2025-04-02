// keyboardNavigation.ts
import { contextMenuController } from "@controllers/floatingMenuController.svelte";
import type { GroupMenuItem } from "@projectTypes/floatingMenuTypes";

/**
 * Acción para gestionar la navegación por teclado en el menú contextual.
 * Se espera que el nodo sea el contenedor que engloba el menú (<div> o similar).
 */
export function keyboardNavigation(node: HTMLElement) {
   let selectedIndex = 0;

   // Función para obtener los elementos <li> actualizados del menú.
   function getItems(): HTMLElement[] {
      return Array.from(node.querySelectorAll("li"));
   }

   // Actualiza el foco y resalta el elemento seleccionado.
   function updateFocus() {
      const items = getItems();
      if (items.length === 0) return;

      // Garantizar que el índice esté dentro de los límites.
      if (selectedIndex < 0) selectedIndex = 0;
      if (selectedIndex >= items.length) selectedIndex = items.length - 1;

      items.forEach((item, index) => {
         if (index === selectedIndex) {
            item.classList.add("bg-gray-200"); // Clase para resaltar el foco.
            item.setAttribute("tabindex", "0");
            (item as HTMLElement).focus();
         } else {
            item.classList.remove("bg-gray-200");
            item.removeAttribute("tabindex");
         }
      });
   }

   function onKeyDown(e: KeyboardEvent) {
      const items = getItems();
      if (items.length === 0) return;

      switch (e.key) {
         case "ArrowDown":
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % items.length;
            updateFocus();
            break;
         case "ArrowUp":
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            updateFocus();
            break;
         case "ArrowRight": {
            const selectedItem = items[selectedIndex];
            if (selectedItem && selectedItem.dataset.type === "group") {
               try {
                  const group: GroupMenuItem = JSON.parse(
                     selectedItem.dataset.item || "{}",
                  );
                  contextMenuController.setActiveSubMenu(group);
               } catch (error) {
                  console.error("Error al parsear el data del grupo:", error);
               }
            }
            break;
         }
         case "ArrowLeft":
            contextMenuController.unsetActiveSubMenu();
            break;
         case "Enter":
         case " ":
            e.preventDefault();
            const button = items[selectedIndex]?.querySelector("button");
            button?.click();
            break;
         case "Escape": {
            const { activeSubMenu } = contextMenuController.getMenuState();
            if (activeSubMenu !== undefined) {
               contextMenuController.unsetActiveSubMenu();
            } else {
               contextMenuController.close();
            }
            break;
         }
      }
   }

   node.addEventListener("keydown", onKeyDown);
   // Inicializa el foco al montar la acción.
   updateFocus();

   return {
      destroy() {
         node.removeEventListener("keydown", onKeyDown);
      },
   };
}
