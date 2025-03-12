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
  windowSize = $state<WindowDimensions>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Inicialización de los listeners globales
  constructor() {
    if (typeof window !== "undefined") {
      // Usamos delegación de eventos con un solo listener global
      // window.addEventListener("resize", this.handleWindowResize);
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

  getPositionX() {
    return this.position.x;
  }
  getPositionY() {
    return this.position.y;
  }
}

// Exportamos una única instancia para toda la aplicación
export const contextMenuController = new ContextMenuController();
