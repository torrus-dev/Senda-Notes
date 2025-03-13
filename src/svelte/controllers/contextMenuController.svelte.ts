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
      window.addEventListener("resize", this.handleWindowResize);
    }
  }
  destroy() {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", this.handleWindowResize);
    }
  }

  private handleWindowResize = () => {
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
          y:
            this.menuType === "dropdown"
              ? this.triggerInfo.rect.bottom + this.DROPDOWN_MARGIN
              : this.triggerInfo.rect.bottom,
        };
      }
    }
  };

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
      y: rect.bottom + this.DROPDOWN_MARGIN, // Añadido el margen aquí
    };
    this.menuItems = menuItems;
    this.isOpen = true;
    this.menuDimensions = { width: 0, height: 0 };
    this.initialRender = true;
  }

  getAdaptedPosition(): Coordinates {
    // Si el menú no está abierto o no se han medido sus dimensiones, devuelve la posición original.
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

    // Función helper para limitar el valor entre un mínimo y un máximo.
    const clamp = (value: number, min: number, max: number): number =>
      Math.min(Math.max(value, min), max);

    // Ajuste horizontal
    if (x + menuWidth > winWidth) {
      x =
        this.menuType === "context"
          ? this.position.x - menuWidth
          : this.triggerInfo
            ? this.triggerInfo.rect.right - menuWidth
            : x;
    }
    // Limitar para que no se salga por la izquierda ni por la derecha.
    x = clamp(x, 5, winWidth - menuWidth - 5);

    // Ajuste vertical
    if (y + menuHeight > winHeight) {
      y =
        this.menuType === "context"
          ? this.position.y - menuHeight
          : this.triggerInfo
            ? this.triggerInfo.rect.top - menuHeight - this.DROPDOWN_MARGIN
            : y;
    }
    // Limitar para que no se salga por arriba ni por abajo.
    y = clamp(y, 5, winHeight - menuHeight - 5);

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
