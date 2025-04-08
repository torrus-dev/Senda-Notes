import { GroupMenuItem, MenuItem } from "@projectTypes/editorMenuTypes";

export interface Coordinates {
   x: number;
   y: number;
}

export interface Dimensions {
   width: number;
   height: number;
}

export interface BaseMenuData {
   type: "context" | "dropdown" | undefined;
   isOpen: boolean;
   menuItems: MenuItem[];
   activeSubMenu: GroupMenuItem | undefined;
   previousFocusedElement: HTMLElement | undefined;
   triggerElement?: HTMLElement | undefined;
}

export interface ContextMenuData extends BaseMenuData {
   type: "context";
   originalPosition: Coordinates;
}

export interface DropdownMenuData extends BaseMenuData {
   type: "dropdown";
   triggerElement: HTMLElement | undefined;
}

export type FloatingMenuData = ContextMenuData | DropdownMenuData;

export interface RenderItem {
   renderId: string;
   menuItem: MenuItem;
   htmlElement?: HTMLElement;
}
