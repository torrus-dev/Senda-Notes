import type {
   Coordinates,
   ContextMenuData,
   DropdownMenuData,
   FloatingMenuData,
   RenderItem,
   EmptyMenuData,
} from "@projectTypes/floatingMenuTypes";
import type { MenuItem, GroupMenuItem } from "@projectTypes/editorMenuTypes";

class FloatingMenuController {
   private emptyMenuState = (): EmptyMenuData => ({
      type: undefined,
      isOpen: false,
      menuItems: [],
      activeSubMenu: undefined,
      previousFocusHolder: undefined,
   });

   renderedMainMenu: RenderItem[] = [];
   renderedSubMenu: RenderItem[] = [];

   private state = $state<FloatingMenuData>(this.emptyMenuState());

   getMenuState = (): FloatingMenuData => this.state;

   openContextMenu(position: Coordinates, menuItems: MenuItem[]) {
      // Guardamos el elemento que tiene el foco antes de abrir el menú
      const previousFocusedElement = document.activeElement as
         | HTMLElement
         | undefined;

      this.state = {
         ...this.emptyMenuState(),
         type: "context",
         isOpen: true,
         menuItems,
         originalPosition: position,
         previousFocusHolder: previousFocusedElement,
      } as ContextMenuData;

      this.renderedSubMenu = [];
      this.renderedMainMenu = [];
   }

   openDropdownMenu(triggerElement: HTMLElement, menuItems: MenuItem[]) {
      // Guardamos el elemento que tiene el foco antes de abrir el menú
      const previousFocusedElement = document.activeElement as
         | HTMLElement
         | undefined;

      this.state = {
         ...this.emptyMenuState(),
         type: "dropdown",
         isOpen: true,
         menuItems,
         triggerElement,
         previousFocusHolder: previousFocusedElement,
      } as DropdownMenuData;

      this.renderedSubMenu = [];
      this.renderedMainMenu = [];
   }

   closeMenu() {
      this.renderedMainMenu = [];
      this.renderedSubMenu = [];

      if (this.state.previousFocusHolder) {
         this.state.previousFocusHolder.focus();
      }
      this.state = this.emptyMenuState();
   }

   setActiveSubMenu = (groupMenuItem: GroupMenuItem): void => {
      if (this.state.type === "context") {
         (this.state as ContextMenuData).activeSubMenu = groupMenuItem;
      } else {
         (this.state as DropdownMenuData).activeSubMenu = groupMenuItem;
      }
   };

   unsetActiveSubMenu = (): void => {
      if (this.state.type === "context") {
         (this.state as ContextMenuData).activeSubMenu = undefined;
      } else {
         (this.state as DropdownMenuData).activeSubMenu = undefined;
      }
      this.renderedSubMenu = [];
      this.renderedMainMenu = [];
   };

   getActiveSubMenu = (): GroupMenuItem | undefined => this.state.activeSubMenu;
   getTriggerElement = (): HTMLElement | undefined => {
      if (this.state.type === "dropdown") {
         return this.state.triggerElement;
      } else {
         return undefined;
      }
   };
}

export const floatingMenuController = new FloatingMenuController();
