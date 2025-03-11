// Tipos para las opciones del menú
export interface MenuItemIcon {
  size?: string | number;
  [key: string]: any;
}

export interface MenuItem {
  label: string;
  icon?: any; // Lucide icon component
  onClick?: () => void;
  class?: string;
  separator?: boolean;
}

// Posición del menú
interface Position {
  x: number;
  y: number;
}

// Clase singleton para gestionar el estado del menú contextual
class ContextMenuController {
  // Estado del menú - usando runas de Svelte 5
  isOpen = $state(false);
  position = $state<Position>({ x: 0, y: 0 });
  items = $state<MenuItem[]>([]);
  triggerElement = $state<HTMLElement | null>(null);

  // Estado derivado para los ajustes de posición
  adjustedPosition = $derived.by(() => {
    if (!this.isOpen || typeof window === "undefined") return this.position;

    const { x, y } = this.position;
    const menuElement = document.getElementById("context-menu");

    if (!menuElement) return { x, y };

    const menuRect = menuElement.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Ajustar posición para evitar salirse por cualquier lado
    let adjustedX = x;
    let adjustedY = y;

    // Ajuste horizontal
    if (x + menuRect.width > windowWidth) {
      adjustedX = windowWidth - menuRect.width - 5; // Margen de 5px
    }
    if (adjustedX < 5) adjustedX = 5; // Mínimo margen izquierdo

    // Ajuste vertical - si no hay espacio abajo, mostrar arriba
    if (y + menuRect.height > windowHeight) {
      // Si hay un elemento activador, posicionar encima de él
      if (this.triggerElement) {
        const triggerRect = this.triggerElement.getBoundingClientRect();
        adjustedY = triggerRect.top - menuRect.height;
      } else {
        // Si no hay activador, simplemente ajustar para que quepa
        adjustedY = windowHeight - menuRect.height - 5; // Margen de 5px
      }
    }
    if (adjustedY < 5) adjustedY = 5; // Mínimo margen superior

    return { x: adjustedX, y: adjustedY };
  });

  // Inicialización de los listeners globales
  constructor() {
    if (typeof window !== "undefined") {
      // Usamos delegación de eventos con un solo listener global
      window.addEventListener("click", this.handleGlobalClick);
      window.addEventListener("contextmenu", this.handleGlobalContextMenu);
      window.addEventListener("keydown", this.handleKeyDown);
      window.addEventListener("scroll", this.handleScroll, true);
      window.addEventListener("resize", this.handleResize);
    }
  }

  // Método para abrir el menú
  open(
    position: Position,
    items: MenuItem[],
    triggerElement: HTMLElement | null = null,
  ) {
    this.position = position;
    this.items = items;
    this.triggerElement = triggerElement;
    this.isOpen = true;
  }

  // Método para cerrar el menú
  close() {
    this.isOpen = false;
    this.items = [];
    this.triggerElement = null;
  }

  // Delegación de eventos global para clics
  handleGlobalClick = (event: MouseEvent) => {
    if (!this.isOpen) return;

    const menuElement = document.getElementById("context-menu");
    if (!menuElement) {
      this.close();
      return;
    }

    // Si el clic fue fuera del menú, cerrarlo
    if (!menuElement.contains(event.target as Node)) {
      this.close();
    }
  };

  // Delegación de eventos global para clic derecho
  handleGlobalContextMenu = (event: MouseEvent) => {
    // Si se abre un nuevo menú contextual, cerrar el actual
    if (this.isOpen) {
      const menuElement = document.getElementById("context-menu");
      if (menuElement && !menuElement.contains(event.target as Node)) {
        this.close();
      }
    }
  };

  // Manejador para las teclas (Escape para cerrar, flechas para navegar)
  handleKeyDown = (event: KeyboardEvent) => {
    if (!this.isOpen) return;

    if (event.key === "Escape") {
      this.close();
      return;
    }

    const menuElement = document.getElementById("context-menu");
    if (!menuElement) return;

    // Navegar con las teclas de flecha
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();

      const menuItems = Array.from(
        menuElement.querySelectorAll('[role="menuitem"]'),
      );
      if (menuItems.length === 0) return;

      const currentIndex = menuItems.findIndex(
        (item) => item === document.activeElement,
      );
      let nextIndex = 0;

      if (event.key === "ArrowDown") {
        nextIndex =
          currentIndex < 0 || currentIndex >= menuItems.length - 1
            ? 0
            : currentIndex + 1;
      } else {
        nextIndex = currentIndex <= 0 ? menuItems.length - 1 : currentIndex - 1;
      }

      (menuItems[nextIndex] as HTMLElement).focus();
    }

    // Seleccionar con Enter
    if (
      event.key === "Enter" &&
      document.activeElement?.hasAttribute("role") &&
      document.activeElement.getAttribute("role") === "menuitem"
    ) {
      event.preventDefault();
      (document.activeElement as HTMLElement).click();
    }
  };

  // Recalcular la posición al desplazarse
  handleScroll = () => {
    if (this.isOpen) {
      // Forzar recálculo de la posición ajustada
      this.position = { ...this.position };
    }
  };

  // Recalcular la posición al cambiar el tamaño de la ventana
  handleResize = () => {
    if (this.isOpen) {
      // Forzar recálculo de la posición ajustada
      this.position = { ...this.position };
    }
  };

  // Método para abrir el menú como dropdown normal
  openAsDropdown(triggerElement: HTMLElement, items: MenuItem[]) {
    const rect = triggerElement.getBoundingClientRect();
    const position = {
      x: rect.left,
      y: rect.bottom,
    };

    this.open(position, items, triggerElement);
  }
}

// Exportamos una única instancia para toda la aplicación
export const contextMenuController = new ContextMenuController();
