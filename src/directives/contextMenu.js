// contextMenu.js
import { contextMenuController } from "../svelte/controllers/contextMenuController.svelte";

function checkValid(options) {
  if (options && Array.isArray(options) && options.length > 0) {
    const realOptions = options.filter((item) => !item.separator);
    if (realOptions.length > 0) {
      return true;
    }
  }
  return false;
}

// Directiva para abrir el menú como context menu (con clic derecho)
export function contextMenu(node, options) {
  // Si no hay opciones válidas o options es undefined, no hacer nada
  if (!options || !checkValid(options)) {
    return {
      update() {},
      destroy() {},
    };
  }

  function handleContextMenu(event) {
    // Prevenir el menú contextual del navegador
    event.preventDefault();
    event.stopPropagation();

    

    // Abrir nuestro menú contextual personalizado
    contextMenuController.open(
      { x: event.clientX, y: event.clientY },
      options,
      node,
    );
  }

  // Añadir el event listener
  node.addEventListener("contextmenu", handleContextMenu);

  return {
    // Actualizar las opciones si cambian
    update(newOptions) {
      options = newOptions;

      // Si las opciones cambian a inválidas, remover el listener
      if (!checkValid(newOptions)) {
        node.removeEventListener("contextmenu", handleContextMenu);
      } else if (!checkValid(options) && checkValid(newOptions)) {
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
export function dropdownMenu(node, options) {
  // Si no hay opciones válidas o options es undefined, no hacer nada
  if (!options || !checkValid(options)) {
    return {
      update() {},
      destroy() {},
    };
  }

  let isOpen = false;

  function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    // Toggle: si está abierto, cerrar; si está cerrado, abrir
    if (isOpen) {
      contextMenuController.close();
      isOpen = false;
    } else {
      contextMenuController.openAsDropdown(node, options);
      isOpen = true;

      // Actualizar estado cuando se cierre el menú por otra interacción
      const checkIfClosed = () => {
        if (!contextMenuController.isOpen) {
          isOpen = false;
          // Dejar de comprobar
          clearInterval(interval);
        }
      };

      // Comprobar periódicamente si el menú se ha cerrado
      const interval = setInterval(checkIfClosed, 100);
    }
  }

  // Añadir el event listener
  node.addEventListener("click", handleClick);

  return {
    // Actualizar las opciones si cambian
    update(newOptions) {
      const wasValid = checkValid(options);
      const isValid = checkValid(newOptions);

      options = newOptions;

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
