import type {
   MenuItem,
   Coordinates,
   GroupMenuItem,
   ContextMenuData,
   DropdownMenuData,
} from "@projectTypes/floatingMenuTypes";

class ContextMenuController {
   private resetMenuState = (): ContextMenuData => ({
      isOpen: false,
      menuItems: [],
      originalPosition: { x: 0, y: 0 },
      activeSubMenu: undefined,
   });

   private state = $state<ContextMenuData>(this.resetMenuState());

   getMenuState = (): ContextMenuData => this.state;

   openMenu(position: Coordinates, menuItems: MenuItem[]) {
      this.state.isOpen = true;
      this.state.menuItems = menuItems;
      this.state.originalPosition = position;
      this.state.activeSubMenu = undefined;
   }

   setActiveSubMenu = (groupMenuITem: GroupMenuItem): void => {
      this.state.activeSubMenu = groupMenuITem;
   };
   unsetActiveSubMenu = (): void => {
      this.state.activeSubMenu = undefined;
   };

   getActiveSubMenu = (): GroupMenuItem | undefined => this.state.activeSubMenu;

   close() {
      this.state = this.resetMenuState();
   }
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
