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

// Enumeración para los tipos de menú
export enum MenuType {
  Context, // Menú de clic derecho
  Dropdown, // Menú desplegable normal
}

// Posición del menú
interface Position {
  x: number;
  y: number;
}

// Información sobre los límites del elemento activador
interface TriggerInfo {
  element: HTMLElement;
  rect: DOMRect;
}

// Clase singleton para gestionar el estado del menú contextual
class ContextMenuController {
  // Estado del menú - usando runas de Svelte 5
  isOpen = $state(false);
  position = $state<Position>({ x: 0, y: 0 });
  items = $state<MenuItem[]>([]);
  triggerInfo = $state<TriggerInfo | null>(null);
  menuType = $state<MenuType>(MenuType.Context);

  // Márgenes de seguridad desde los bordes de la ventana
  private readonly SAFETY_MARGIN = 8;

  // Estado derivado para los ajustes de posición
  adjustedPosition = $derived.by(() => {
    if (!this.isOpen || typeof window === "undefined") return this.position;

    // Esperar a que el menú esté renderizado para obtener sus dimensiones
    const menuElement = document.getElementById("context-menu");
    if (!menuElement) return this.position;

    // Forzar un reflow para asegurar que las dimensiones del menú estén disponibles
    // Esto es crucial para el primer clic
    void menuElement.offsetWidth;

    const menuRect = menuElement.getBoundingClientRect();
    return this.calculateOptimalPosition(menuRect);
  });

  // Método para calcular la posición óptima del menú
  private calculateOptimalPosition(menuRect: DOMRect): Position {
    const { x, y } = this.position;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Posición inicial ajustada
    let adjustedX = x;
    let adjustedY = y;

    // Estrategia de posicionamiento según el tipo de menú
    if (this.menuType === MenuType.Context) {
      // Para menú contextual (aparece donde el usuario hace clic derecho)

      // Ajuste horizontal - asegurar que no se salga por la derecha
      if (x + menuRect.width > windowWidth - this.SAFETY_MARGIN) {
        adjustedX = windowWidth - menuRect.width - this.SAFETY_MARGIN;
      }

      // Ajuste vertical - asegurar que no se salga por abajo
      if (y + menuRect.height > windowHeight - this.SAFETY_MARGIN) {
        adjustedY = windowHeight - menuRect.height - this.SAFETY_MARGIN;
      }

      // Asegurar que no se salga por la izquierda o arriba
      adjustedX = Math.max(this.SAFETY_MARGIN, adjustedX);
      adjustedY = Math.max(this.SAFETY_MARGIN, adjustedY);
    } else if (this.menuType === MenuType.Dropdown && this.triggerInfo) {
      // Para menú dropdown (aparece debajo del elemento activador)
      const { rect } = this.triggerInfo;

      // Por defecto, alinear con el borde izquierdo del activador
      adjustedX = rect.left;
      adjustedY = rect.bottom;

      // Comprobar si el menú se saldría por la derecha
      if (adjustedX + menuRect.width > windowWidth - this.SAFETY_MARGIN) {
        // Si se sale por la derecha, alinear con el borde derecho del activador
        adjustedX = rect.right - menuRect.width;

        // Si aún se sale, forzar a que esté dentro de la ventana
        if (adjustedX < this.SAFETY_MARGIN) {
          adjustedX = this.SAFETY_MARGIN;
        }
      }

      // Comprobar si el menú se saldría por abajo
      if (adjustedY + menuRect.height > windowHeight - this.SAFETY_MARGIN) {
        // Si se sale por abajo, mostrar arriba del activador
        adjustedY = rect.top - menuRect.height;

        // Si se sale por arriba también, mostrar donde haya más espacio
        if (adjustedY < this.SAFETY_MARGIN) {
          const spaceAbove = rect.top;
          const spaceBelow = windowHeight - rect.bottom;

          if (spaceBelow >= spaceAbove) {
            // Hay más espacio abajo, mostrar abajo y permitir scroll
            adjustedY = rect.bottom;
          } else {
            // Hay más espacio arriba, mostrar arriba y permitir scroll
            adjustedY = Math.max(
              this.SAFETY_MARGIN,
              rect.top - menuRect.height,
            );
          }
        }
      }
    }

    return { x: adjustedX, y: adjustedY };
  }

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
    menuType: MenuType = MenuType.Context,
  ) {
    this.position = position;
    this.items = items;
    this.menuType = menuType;

    // Guardar información del elemento activador si existe
    if (triggerElement) {
      this.triggerInfo = {
        element: triggerElement,
        rect: triggerElement.getBoundingClientRect(),
      };
    } else {
      this.triggerInfo = null;
    }

    this.isOpen = true;

    // Importante: Programar un ajuste de posición después de que el menú se haya renderizado
    // Esto soluciona el problema del primer clic
    setTimeout(() => {
      const menuElement = document.getElementById("context-menu");
      if (menuElement) {
        // Forzar un recálculo de la posición después de que el menú esté en el DOM
        this.position = { ...this.position };
      }
    }, 0);
  }

  // Método para cerrar el menú
  close() {
    this.isOpen = false;
    this.items = [];
    this.triggerInfo = null;
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
    if (this.isOpen && this.triggerInfo?.element) {
      // Actualizar el rect del elemento activador al desplazarse
      this.triggerInfo = {
        element: this.triggerInfo.element,
        rect: this.triggerInfo.element.getBoundingClientRect(),
      };
      // Forzar recálculo de la posición ajustada
      this.position = { ...this.position };
    } else if (this.isOpen) {
      // Si no hay elemento activador, solo actualizar la posición
      this.position = { ...this.position };
    }
  };

  // Recalcular la posición al cambiar el tamaño de la ventana
  handleResize = () => {
    if (this.isOpen && this.triggerInfo?.element) {
      // Actualizar el rect del elemento activador al cambiar el tamaño
      this.triggerInfo = {
        element: this.triggerInfo.element,
        rect: this.triggerInfo.element.getBoundingClientRect(),
      };
      // Forzar recálculo de la posición ajustada
      this.position = { ...this.position };
    } else if (this.isOpen) {
      // Si no hay elemento activador, solo actualizar la posición
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
    this.open(position, items, triggerElement, MenuType.Dropdown);
  }
}

// Exportamos una única instancia para toda la aplicación
export const contextMenuController = new ContextMenuController();
