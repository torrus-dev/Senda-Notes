// FLOATING MENU
export interface Coordinates {
   x: number;
   y: number;
}

export interface Dimensions {
   width: number;
   height: number;
}

export interface MenuData {
   type: "context" | "dropdown" | undefined;
   isOpen: boolean;
   menuItems: MenuItem[];
   activeSubMenu: GroupMenuItem | undefined;
   previousFocusHolder: HTMLElement | undefined;
}

export interface EmptyMenuData extends MenuData {
   type: undefined;
}

export interface ContextMenuData extends MenuData {
   type: "context";
   originalPosition: Coordinates;
}

export interface DropdownMenuData extends MenuData {
   type: "dropdown";
   triggerElement: HTMLElement | undefined;
}

export type FloatingMenuData =
   | EmptyMenuData
   | ContextMenuData
   | DropdownMenuData;

export interface RenderItem {
   renderId: string;
   menuItem: MenuItem;
   htmlElement?: HTMLElement;
}

// MENU CONTENT
interface BaseMenuItem {
   type: "separator" | "group" | "action";
   label: string;
   icon?: any;
   class?: string;
}
export interface SeparatorMenuItem {
   type: "separator";
}
export interface ActionMenuItem extends BaseMenuItem {
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
