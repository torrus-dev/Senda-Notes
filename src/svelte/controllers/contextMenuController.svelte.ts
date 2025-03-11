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
  menuElement = $derived(document.getElementById("context-menu"));
  windowSize = $state({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Márgenes de seguridad desde los bordes de la ventana
  private readonly SAFETY_MARGIN = 8;

  // Inicialización de los listeners globales
  constructor() {
    if (typeof window !== "undefined") {
      // Usamos delegación de eventos con un solo listener global
      window.addEventListener("resize", () => {
        this.windowSize = {
          width: window.innerWidth,
          height: window.innerHeight,
        };
        console.log(this.windowSize);
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
      });
    }
  }

  // Método para cerrar el menú
  close() {
    this.isOpen = false;
    this.items = [];
    this.triggerInfo = null;
  }

  openContextMenu(position: Position, menuItems: MenuItem[]) {
    this.position = position;
    this.items = menuItems;
    this.isOpen = true;
  }

  openDropdownMenu(triggerElement: HTMLElement, menuItems: MenuItem[]) {
    const rect = triggerElement.getBoundingClientRect();
    const recposition = {
      x: rect.left,
      y: rect.bottom,
    };
    this.position = recposition;
    this.items = menuItems;
    this.isOpen = true;
  }

  getPositionX() {
    return this.position.x;
  }
  getPositionY() {
    return this.position.y;
  }
}

// Exportamos una única instancia para toda la aplicación
export const contextMenuController = new ContextMenuController();
