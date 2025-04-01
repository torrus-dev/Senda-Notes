import type {
   ContextMenuData,
   MenuItem,
   Coordinates,
   DropdownMenuData,
} from "@projectTypes/floatingMenuTypes";

class ContextMenuController {
   private resetMenuState = (): ContextMenuData => ({
      isOpen: false,
      menuItems: [],
      originalPosition: { x: 0, y: 0 },
   });

   private state = $state<ContextMenuData>(this.resetMenuState());

   getMenuState = (): ContextMenuData => this.state;

   openMenu(position: Coordinates, menuItems: MenuItem[]) {
      this.state.isOpen = true;
      this.state.menuItems = menuItems;
      this.state.originalPosition = position;
   }

   close() {
      this.state = this.resetMenuState();
   }
}

class DropdownMenuController {
   private resetMenuState = (): DropdownMenuData => ({
      isOpen: false,
      menuItems: [],
      triggerElement: null,
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
