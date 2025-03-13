import type { MenuItem, Coordinates, TriggerInfo } from "../types/contextMenu";
import { workspace } from "./workspaceController.svelte";

// Clase singleton para gestionar el estado del menú contextual
class ContextMenuController {
  menuType = $state<"dropdown" | "context" | null>(null);
  isOpen = $state<boolean>(false);
  position = $state<Coordinates>({ x: 0, y: 0 });
  menuItems = $state<MenuItem[]>([]);
  triggerInfo = $state<TriggerInfo | null>(null);

  menuDimensions = $state({ width: 0, height: 0 });
  initialRender = $state(true); // Controla si es el primer renderizado

  windowSize = $derived(workspace.windowSize);

  readonly DROPDOWN_MARGIN = 4;

  // Inicialización de los listeners globales
  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("resize", () => this.handleWindowResize());
    }
  }

  private handleWindowResize() {
    // Forzar recálculo de la posición al cambiar el tamaño de la ventana
    if (this.isOpen && this.menuDimensions.width > 0) {
      if (this.triggerInfo?.element) {
        // Para dropdown menus, actualizar la posición del trigger
        this.triggerInfo = {
          element: this.triggerInfo.element,
          rect: this.triggerInfo.element.getBoundingClientRect(),
        };
        this.position = {
          x: this.triggerInfo.rect.left,
          y: this.triggerInfo.rect.bottom,
        };
      }
    }
  }

  close() {
    this.menuType = null;
    this.isOpen = false;
    this.menuItems = [];
    this.triggerInfo = null;
    this.menuDimensions = { width: 0, height: 0 };
    this.initialRender = true;
  }

  openContextMenu(position: Coordinates, menuItems: MenuItem[]) {
    this.menuType = "context";
    this.position = position;
    this.menuItems = menuItems;
    this.triggerInfo = null;
    this.isOpen = true;
    this.menuDimensions = { width: 0, height: 0 };
    this.initialRender = true;
  }

  openDropdownMenu(triggerElement: HTMLElement, menuItems: MenuItem[]) {
    this.menuType = "dropdown";
    const rect = triggerElement.getBoundingClientRect();
    this.triggerInfo = {
      element: triggerElement,
      rect: rect,
    };
    this.position = {
      x: rect.left,
      y: rect.bottom,
    };
    this.menuItems = menuItems;
    this.isOpen = true;
    this.menuDimensions = { width: 0, height: 0 };
    this.initialRender = true;
  }

  getAdaptedPosition(): Coordinates {
    // Si no hay dimensiones de menú o no está abierto, devolver posición original
    if (
      !this.isOpen ||
      !this.menuDimensions.width ||
      !this.menuDimensions.height
    ) {
      return this.position;
    }

    let { x, y } = this.position;
    const { width: menuWidth, height: menuHeight } = this.menuDimensions;
    const { width: winWidth, height: winHeight } = this.windowSize;

    // Verificar y ajustar horizontalmente
    if (x + menuWidth > winWidth) {
      if (this.menuType === "context") {
        // Para context menu, colocar a la izquierda del cursor
        x = Math.max(0, this.position.x - menuWidth);
      } else if (this.menuType === "dropdown" && this.triggerInfo) {
        // Para dropdown, alinear con el borde derecho del trigger
        x = Math.max(0, this.triggerInfo.rect.right - menuWidth);
      }
    }

    // Verificar y ajustar verticalmente
    if (y + menuHeight > winHeight) {
      if (this.menuType === "context") {
        // Para context menu, colocar arriba del cursor
        y = Math.max(0, this.position.y - menuHeight);
      } else if (this.menuType === "dropdown" && this.triggerInfo) {
        // Para dropdown, colocar arriba del trigger
        y = Math.max(0, this.triggerInfo.rect.top - menuHeight);
      }
    }

    // Asegurar que no se salga por la izquierda o arriba
    x = Math.max(5, x);
    y = Math.max(5, y);

    // Asegurar que el menú sea visible aunque sea parcialmente
    if (x + menuWidth > winWidth) {
      x = Math.max(5, winWidth - menuWidth - 5);
    }
    if (y + menuHeight > winHeight) {
      y = Math.max(5, winHeight - menuHeight - 5);
    }

    return { x, y };
  }

  setMenuDimensions(width: number, height: number) {
    // Solo actualizar si las dimensiones son válidas y diferentes
    if (
      width > 0 &&
      height > 0 &&
      (width !== this.menuDimensions.width ||
        height !== this.menuDimensions.height)
    ) {
      this.menuDimensions = { width, height };
      this.initialRender = false;
    }
  }
}

// Exportamos una única instancia para toda la aplicación
export const contextMenuController = new ContextMenuController();
