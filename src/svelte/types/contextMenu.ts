import type { Component } from "svelte";

// Tipos para las opciones del menú
export interface MenuItem {
  label: string;
  icon?: Component;
  onClick?: () => void;
  class?: string;
  separator?: boolean;
  checked?: boolean;
}

// Posición del menú
export interface Coordinates {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

// Información sobre el elemento activador
export interface TriggerInfo {
  element: HTMLElement;
  rect: DOMRect;
}

// Tipo para el menú
export type MenuType = "dropdown" | "context" | null;
