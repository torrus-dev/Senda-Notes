import { GroupMenuItem, MenuItem } from "./editorMenuTypes";

export interface Coordinates {
   x: number;
   y: number;
}

export interface Dimensions {
   width: number;
   height: number;
}

export interface ContextMenuData {
   isOpen: boolean;
   menuItems: MenuItem[];
   originalPosition: Coordinates;
   activeSubMenu: GroupMenuItem | undefined;
   previousFocusedElement: HTMLElement | undefined;
}

export interface DropdownMenuData {
   isOpen: boolean;
   menuItems: MenuItem[];
   triggerElement: HTMLElement | null;
   activeSubMenu: GroupMenuItem | undefined;
}

export interface RenderItem {
   renderId: string;
   menuItem: MenuItem;
   htmlElement?: HTMLElement;
}
