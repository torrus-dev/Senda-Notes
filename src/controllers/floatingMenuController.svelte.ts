import type {
   MenuItem,
   GroupMenuItem,
   ContextMenuData,
   DropdownMenuData,
   RenderItem,
} from "@projectTypes/floatingMenuTypes";
import type { Coordinates } from "@projectTypes/positionTypes";

class ContextMenuController {
   private startingMenuState = (): ContextMenuData => ({
      isOpen: false,
      menuItems: [],
      originalPosition: { x: 0, y: 0 },
      activeSubMenu: undefined,
      previousFocusedElement: undefined,
   });

   renderedMainMenu: RenderItem[] = [];
   renderedSubMenu: RenderItem[] = [];

   private state = $state<ContextMenuData>(this.startingMenuState());

   getMenuState = (): ContextMenuData => this.state;

   openMenu(position: Coordinates, menuItems: MenuItem[]) {
      this.state.isOpen = true;
      this.state.menuItems = menuItems;
      this.state.originalPosition = position;
      this.state.activeSubMenu = undefined;

      // recordar donde se encontraba el foco antes de abrir el context menu
      this.state.previousFocusedElement = document.activeElement as
         | HTMLElement
         | undefined;

      this.renderedSubMenu = [];
      this.renderedMainMenu = [];
   }

   closeMenu() {
      this.renderedMainMenu = [];
      this.renderedSubMenu = [];

      if (this.state.previousFocusedElement) {
         this.state.previousFocusedElement.focus();
      }
      this.state = this.startingMenuState();
   }

   setActiveSubMenu = (groupMenuITem: GroupMenuItem): void => {
      this.state.activeSubMenu = groupMenuITem;
   };
   unsetActiveSubMenu = (): void => {
      this.state.activeSubMenu = undefined;
      this.renderedSubMenu = [];
      this.renderedMainMenu = [];
   };

   getActiveSubMenu = (): GroupMenuItem | undefined => this.state.activeSubMenu;
}

class DropdownMenuController {
   private resetMenuState = (): DropdownMenuData => ({
      isOpen: false,
      menuItems: [],
      triggerElement: null,
      activeSubMenu: undefined,
   });

   private state = $state<DropdownMenuData>(this.resetMenuState());

   getMenuState = (): DropdownMenuData => this.state;

   openMenu(triggerElement: HTMLElement, menuItems: MenuItem[]) {
      this.state.isOpen = true;
      this.state.menuItems = menuItems;
      this.state.triggerElement = triggerElement;
   }

   close() {
      this.state = this.resetMenuState();
   }
}

// Exportamos una única instancia para toda la aplicación
export const contextMenuController = new ContextMenuController();
export const dropdownMenuController = new DropdownMenuController();
