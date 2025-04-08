import { GroupMenuItem, MenuItem } from "@projectTypes/editorMenuTypes";

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
