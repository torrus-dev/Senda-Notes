export interface ContextMenuData {
   isOpen: boolean;
   menuItems: MenuItem[];
   originalPosition: Coordinates;
   activeSubMenu: GroupMenuItem | undefined;
}

export interface DropdownMenuData {
   isOpen: boolean;
   menuItems: MenuItem[];
   triggerElement: HTMLElement | null;
   activeSubMenu: GroupMenuItem | undefined;
}

interface BaseMenuItem {
   id: string;
   type: "separator" | "group" | "action";
   label: string;
   icon?: any;
   class?: string;
}
export interface SeparatorMenuItem {
   type: "separator";
}
export interface ActionMenuItem extends BaseMenuItem {
   id: string;
   type: "action";
   disabled?: boolean;
   action: () => void;
   checked?: boolean;
   children?: never;
}
export interface GroupMenuItem extends BaseMenuItem {
   type: "group";
   children: MenuItem[];
   action?: never;
   checked?: never;
}
export type MenuItem = ActionMenuItem | GroupMenuItem | SeparatorMenuItem;

// Posición del menú
export interface Coordinates {
   x: number;
   y: number;
}

export interface Dimensions {
   width: number;
   height: number;
}

export interface RenderItem {
   renderId: string;
   menuItem: MenuItem;
   htmlElement?: HTMLElement;
}
