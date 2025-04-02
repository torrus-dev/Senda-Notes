import type { RenderItem } from "@projectTypes/floatingMenuTypes";
import { contextMenuController } from "@controllers/floatingMenuController.svelte";

// Obtiene la lista actual de elementos interactivos según el estado del menú.
function getCurrentItems(): RenderItem[] {
   const menuState = contextMenuController.getMenuState();
   return menuState.activeSubMenu
      ? contextMenuController.renderedSubMenu
      : contextMenuController.renderedMainMenu;
}

/**
 * Configura la navegación por teclado para el menú.
 * Añade un listener que gestiona la navegación y, al desmontarse,
 * restaura el foco al elemento que lo tenía previamente.
 *
 * Se fuerza el foco en el contenedor para que se capten los eventos, pero se oculta el outline mediante Tailwind.
 *
 * @param menuElement El contenedor del menú que captura los eventos de teclado.
 * @returns Una función para remover el listener y restaurar el foco.
 */
export function setupKeyboardNavigation(menuElement: HTMLElement): () => void {
   // Guardamos el elemento que tenía el foco antes de abrir el menú
   const previousFocusedElement = document.activeElement as HTMLElement | null;
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
         console.warn(
            `Focusing item at index ${index} (${items[index].menuItem.label})`,
         );
         items[index].htmlElement.focus();
      } else {
         console.error(
            `No se puede enfocar el elemento en el índice ${index}. Items length: ${items.length}`,
         );
      }
   }

   // Listener para la navegación por teclado
   function keyHandler(e: KeyboardEvent) {
      const items = getCurrentItems();
      console.warn(
         `Tecla presionada: ${e.key}. currentIndex: ${currentIndex}. Items disponibles: ${items.length}`,
      );
      if (items.length === 0) return;

      switch (e.key) {
         case "ArrowDown":
            e.preventDefault();
            if (currentIndex === -1) {
               currentIndex = 0;
            } else {
               currentIndex = (currentIndex + 1) % items.length;
            }
            focusItem(currentIndex);
            break;
         case "ArrowUp":
            e.preventDefault();
            if (currentIndex === -1) {
               currentIndex = items.length - 1;
            } else {
               currentIndex = (currentIndex - 1 + items.length) % items.length;
            }
            focusItem(currentIndex);
            break;
         case "ArrowRight":
            e.preventDefault();
            {
               const currentItem = items[currentIndex];
               if (currentItem && currentItem.menuItem.type === "group") {
                  console.warn(
                     `Entrando al submenu del elemento ${currentItem.menuItem.label}`,
                  );
                  contextMenuController.setActiveSubMenu(currentItem.menuItem);
                  // Al cambiar de menú, reiniciamos el índice a -1
                  currentIndex = -1;
                  // Se espera a que se renderice el submenú para que el usuario interactúe
                  setTimeout(() => {
                     console.warn("Submenu renderizado, esperando interacción");
                  }, 0);
               } else {
                  console.warn(
                     "No hay submenu en el elemento actual o currentIndex no es válido",
                  );
               }
            }
            break;
         case "ArrowLeft":
            e.preventDefault();
            if (contextMenuController.getMenuState().activeSubMenu) {
               console.warn("Volviendo al menú principal desde submenu");
               contextMenuController.unsetActiveSubMenu();
               // Al volver, reiniciamos el índice a -1
               currentIndex = -1;
               setTimeout(() => {
                  console.warn(
                     "Menú principal restaurado, esperando interacción",
                  );
               }, 0);
            }
            break;
         case "Enter":
         case " ":
            e.preventDefault();
            // Revisamos el caso de retorno: si estamos en submenu y el currentIndex es 0
            if (
               contextMenuController.getMenuState().activeSubMenu &&
               currentIndex === 0
            ) {
               console.warn("Seleccionada opción de retorno al menú principal");
               contextMenuController.unsetActiveSubMenu();
               currentIndex = -1;
            } else {
               const activeItem = items[currentIndex];
               if (activeItem && activeItem.htmlElement) {
                  console.warn(
                     `Activando acción del elemento ${activeItem.menuItem.label} en índice ${currentIndex}`,
                  );
                  activeItem.htmlElement.click();
               } else {
                  console.error(
                     "No hay elemento activo para activar la acción.",
                  );
               }
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
      // Restauramos el foco al elemento que lo tenía previamente
      if (previousFocusedElement) {
         previousFocusedElement.focus();
      }
   };
}
