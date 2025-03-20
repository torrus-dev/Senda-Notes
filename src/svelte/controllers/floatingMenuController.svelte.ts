import type {
  MenuItem,
  Coordinates,
  TriggerInfo,
  SubMenuState,
  SubmenuMenuItem,
} from "../types/contextMenuTypes";
import { workspace } from "./workspaceController.svelte";

class FloatingMenuController {
  menuType = $state<"dropdown" | "context" | null>(null);
  isOpen = $state<boolean>(false);
  position = $state<Coordinates>({ x: 0, y: 0 });
  menuItems = $state<MenuItem[]>([]);
  triggerInfo = $state<TriggerInfo | null>(null);

  // Estado del submenú
  subMenu = $state<SubMenuState>({
    isOpen: false,
    parentItemIndex: -1,
    items: [],
    position: { x: 0, y: 0 },
    dimensions: { width: 0, height: 0 },
    initialRender: true,
  });

  menuDimensions = $state({ width: 0, height: 0 });
  initialRender = $state(true); // Controla si es el primer renderizado

  windowSize = $derived(workspace.windowSize);

  readonly DROPDOWN_MARGIN = 4;
  readonly SUBMENU_OFFSET = 2; // Pequeño offset para el submenú

  // Inicialización de los listeners globales
  constructor() {
    if (typeof window !== "undefined" && this.menuType === "dropdown") {
      window.addEventListener("resize", this.handleWindowResize);
    }
  }

  destroy() {
    if (typeof window !== "undefined" && this.menuType === "dropdown") {
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

      // Si el submenú está abierto, actualizar su posición también
      if (this.subMenu.isOpen) {
        this.updateSubMenuPosition();
      }
    }
  };

  close() {
    this.closeSubMenu(); // Cerrar el submenú primero
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

  // Nuevo método para abrir submenús
  openSubMenu(parentElement: HTMLElement, parentItemIndex: number) {
    if (
      !this.isOpen ||
      parentItemIndex < 0 ||
      parentItemIndex >= this.menuItems.length
    ) {
      return;
    }

    const parentItem = this.menuItems[parentItemIndex];

    // Verificar que el ítem es de tipo SubmenuMenuItem y tiene hijos
    if (
      !("children" in parentItem) ||
      !parentItem.children ||
      parentItem.children.length === 0
    ) {
      return;
    }

    // Establecer el índice del elemento padre y los elementos hijos
    this.subMenu.parentItemIndex = parentItemIndex;
    this.subMenu.items = parentItem.children;

    // Calcular la posición inicial del submenú (a la derecha del elemento padre)
    const parentRect = parentElement.getBoundingClientRect();
    this.subMenu.position = {
      x: parentRect.right + this.SUBMENU_OFFSET,
      y: parentRect.top,
    };

    // Reiniciar dimensiones y estado de renderizado
    this.subMenu.dimensions = { width: 0, height: 0 };
    this.subMenu.initialRender = true;
    this.subMenu.isOpen = true;
  }

  // Cerrar el submenú
  closeSubMenu() {
    this.subMenu.isOpen = false;
    this.subMenu.parentItemIndex = -1;
    this.subMenu.items = [];
    this.subMenu.dimensions = { width: 0, height: 0 };
    this.subMenu.initialRender = true;
  }

  // Actualizar posición del submenú basado en la posición del ítem padre
  private updateSubMenuPosition() {
    if (!this.subMenu.isOpen || this.subMenu.parentItemIndex < 0) {
      return;
    }

    const parentItems = document.querySelectorAll("#context-menu > li");
    if (parentItems.length <= this.subMenu.parentItemIndex) {
      return;
    }

    const parentItem = parentItems[this.subMenu.parentItemIndex];
    const parentRect = parentItem.getBoundingClientRect();

    this.subMenu.position = {
      x: parentRect.right + this.SUBMENU_OFFSET,
      y: parentRect.top,
    };
  }

  getAdaptedPosition(isSubMenu = false): Coordinates {
    // Si el menú no está abierto o no se han medido sus dimensiones, devuelve la posición original.
    if (isSubMenu) {
      // Para el submenú
      if (
        !this.subMenu.isOpen ||
        !this.subMenu.dimensions.width ||
        !this.subMenu.dimensions.height
      ) {
        return this.subMenu.position;
      }

      let { x, y } = this.subMenu.position;
      const { width: menuWidth, height: menuHeight } = this.subMenu.dimensions;
      const { width: winWidth, height: winHeight } = this.windowSize;

      // Función helper para limitar el valor entre un mínimo y un máximo.
      const clamp = (value: number, min: number, max: number): number =>
        Math.min(Math.max(value, min), max);

      // Ajuste horizontal - para submenús, intentar mostrar a la izquierda si no cabe a la derecha
      if (x + menuWidth > winWidth) {
        // Si no cabe a la derecha, mostrar a la izquierda del elemento padre
        const parentItems = document.querySelectorAll("#context-menu > li");
        if (parentItems.length > this.subMenu.parentItemIndex) {
          const parentRect =
            parentItems[this.subMenu.parentItemIndex].getBoundingClientRect();
          x = parentRect.left - menuWidth - this.SUBMENU_OFFSET;
        }
      }

      // Limitar para que no se salga por la izquierda ni por la derecha.
      x = clamp(x, 5, winWidth - menuWidth - 5);

      // Ajuste vertical
      if (y + menuHeight > winHeight) {
        // Si no cabe abajo, ajustar para que quede dentro de la ventana
        y = winHeight - menuHeight - 5;
      }

      // Limitar para que no se salga por arriba ni por abajo.
      y = clamp(y, 5, winHeight - menuHeight - 5);

      return { x, y };
    } else {
      // Para el menú principal (código original)
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

  // Nuevo método para establecer dimensiones del submenú
  setSubMenuDimensions(width: number, height: number) {
    // Solo actualizar si las dimensiones son válidas y diferentes
    if (
      width > 0 &&
      height > 0 &&
      (width !== this.subMenu.dimensions.width ||
        height !== this.subMenu.dimensions.height)
    ) {
      this.subMenu.dimensions = { width, height };
      this.subMenu.initialRender = false;
    }
  }
}

// Exportamos una única instancia para toda la aplicación
export const floatingMenuController = new FloatingMenuController();
