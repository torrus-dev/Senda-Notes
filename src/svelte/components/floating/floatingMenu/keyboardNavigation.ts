import type { RenderItem } from "@projectTypes/ui/contextMenuTypes";
import { floatingMenuController } from "@controllers/menu/FloatingMenuController.svelte";

// Obtiene la lista actual de elementos interactivos según el estado del menú.
function getCurrentItems(): RenderItem[] {
   const menuState = floatingMenuController.getMenuState();
   return menuState.activeSubMenu
      ? floatingMenuController.renderedSubMenu
      : floatingMenuController.renderedMainMenu;
}

/**
 * Configura la navegación por teclado para el menú.
 * Añade un listener que gestiona la navegación y, al desmontarse,
 * restaura el foco al elemento que lo tenía previamente.
 *
 * Se fuerza el foco en el contenedor para que se capten los eventos, pero se oculta el outline mediante Tailwind.
 *
 * @param menuElement El contenedor del menú que captura los eventos de teclado.
 */
export function setupKeyboardNavigation(menuElement: HTMLElement): () => void {
   let currentIndex = -1; // -1 indica que ningún elemento está seleccionado inicialmente

   // Aseguramos que el contenedor es focusable y le añadimos clase para ocultar el outline
   if (!menuElement.hasAttribute("tabindex")) {
      menuElement.setAttribute("tabindex", "0");
   }
   menuElement.classList.add("focus:outline-none");

   // Forzamos el foco en el contenedor para capturar los eventos de teclado
   menuElement.focus();

   // Función para enfocar el elemento interactivo en la posición indicada
   function focusItem(index: number) {
      const items = getCurrentItems();
      if (items.length > 0 && items[index]?.htmlElement) {
         items[index].htmlElement.focus();
      }
   }

   // Listener para la navegación por teclado
   function keyHandler(event: KeyboardEvent) {
      const items = getCurrentItems();
      if (items.length === 0) return;

      switch (event.key) {
         case "ArrowDown":
            event.preventDefault();
            if (currentIndex === -1) {
               currentIndex = 0;
            } else {
               currentIndex = (currentIndex + 1) % items.length;
            }
            focusItem(currentIndex);
            break;
         case "ArrowUp":
            event.preventDefault();
            if (currentIndex === -1) {
               currentIndex = items.length - 1;
            } else {
               currentIndex = (currentIndex - 1 + items.length) % items.length;
            }
            focusItem(currentIndex);
            break;
         case "ArrowRight":
            event.preventDefault();
            {
               const currentItem = items[currentIndex];
               if (currentItem && currentItem.menuItem.type === "group") {
                  floatingMenuController.setActiveSubMenu(currentItem.menuItem);
                  // Al cambiar de menú, reiniciamos el índice a -1
                  currentIndex = -1;
                  // Se espera a que se renderice el submenú para que el usuario interactúe
                  setTimeout(() => {}, 0);
               }
            }
            break;
         case "ArrowLeft":
            event.preventDefault();
            if (floatingMenuController.getMenuState().activeSubMenu) {
               floatingMenuController.unsetActiveSubMenu();
               // Al volver, reiniciamos el índice a -1
               currentIndex = -1;
               setTimeout(() => {}, 0);
            }
            break;
         default:
            break;
      }
   }

   // Añadimos el listener al contenedor del menú
   menuElement.addEventListener("keydown", keyHandler);

   // Retornamos una función que remueve el listener y restaura el foco original.
   return () => {
      menuElement.removeEventListener("keydown", keyHandler);
   };
}
