export interface FloatingMenuData {
   isOpen: boolean;
   menuItems: MenuItem[];
   originalPosition: Coordinates;
}

// Interfaz base para propiedades comunes a todos los MenuItems
interface BaseMenuItem {
   label: string;
   icon?: any;
   class?: string;
}

// Tipo para un elemento separador
export interface SeparatorMenuItem {
   separator: true;
}

// Tipo para un elemento de acción (con onClick)
export interface ActionMenuItem extends BaseMenuItem {
   onClick: () => void;
   checked?: boolean;
   children?: never; // No puede tener hijos
}

// Tipo para un elemento de submenú
export interface GroupMenuItem extends BaseMenuItem {
   children: MenuItem[]; // Debe tener hijos
   onClick?: never; // No debe tener onClick
   checked?: never; // No debe tener checked
}

// Tipo unión para todos los tipos de MenuItems
export type MenuItem = ActionMenuItem | GroupMenuItem | SeparatorMenuItem;

// Interfaces para el controlador de menú
export interface Coordinates {
   x: number;
   y: number;
}

export interface TriggerInfo {
   element: HTMLElement;
   rect: DOMRect;
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

// Nueva interfaz para el estado del submenú
export interface SubMenuState {
   isOpen: boolean;
   parentItemIndex: number;
   items: MenuItem[];
   position: Coordinates;
   dimensions: Dimensions;
   initialRender: boolean;
}
