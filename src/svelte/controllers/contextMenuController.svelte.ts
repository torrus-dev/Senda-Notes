import type { Component } from "svelte";

// Tipos para las opciones del menú
export interface MenuItem {
  label: string;
  icon?: Component | undefined; // Lucide icon component
  onClick?: () => void;
  class?: string;
  separator?: boolean;
}

// Posición del menú
interface Coordinates {
  x: number;
  y: number;
}

interface WindowDimensions {
  width: number;
  height: number;
}

// Información sobre los límites del elemento activador
interface TriggerInfo {
  element: HTMLElement;
  rect: DOMRect;
}

// Clase singleton para gestionar el estado del menú contextual
class ContextMenuController {
  menuType = $state<"dropdown" | "context" | null>(null);
  isOpen = $state(false);
  position = $state<Coordinates>({ x: 0, y: 0 });
  menuItems = $state<MenuItem[]>([]);
  triggerInfo = $state<TriggerInfo | null>(null);
  //sacar windowSize y su calculo a workspace controller
  windowSize = $state<WindowDimensions>({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  menuDimensions = $state({ width: 0, height: 0 });

  // Inicialización de los listeners globales
  constructor() {
    if (typeof window !== "undefined") {
      // Usamos delegación de eventos con un solo listener global
      window.addEventListener("resize", this.handleWindowResize);
    }
  }

  private handleWindowResize() {
    this.windowSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
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
  }

  close() {
    this.menuType = null;
    this.isOpen = false;
    this.menuItems = [];
    this.triggerInfo = null;
  }

  openContextMenu(position: Coordinates, menuItems: MenuItem[]) {
    this.menuType = "context";
    this.position = position;
    this.menuItems = menuItems;
    this.isOpen = true;
  }

  openDropdownMenu(triggerElement: HTMLElement, menuItems: MenuItem[]) {
    this.menuType = "dropdown";
    const rect = triggerElement.getBoundingClientRect();
    this.position = rect;
    this.menuItems = menuItems;
    this.isOpen = true;
  }

  getAdaptedPosition(): Coordinates {
    if (contextMenuController.menuType === "context") {
    }
    return this.position;
  }

  setMenuDimensions(width: number, height: number) {
    this.menuDimensions = { width, height };
    console.log(this.menuDimensions);
  }
}

// Exportamos una única instancia para toda la aplicación
export const contextMenuController = new ContextMenuController();
