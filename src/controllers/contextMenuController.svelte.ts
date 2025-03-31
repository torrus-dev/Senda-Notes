import type {
   FloatingMenuData,
   MenuItem,
   Coordinates,
} from "@projectTypes/floatingMenuTypes";

class ContextMenuController {
   private resetMenuState = (): FloatingMenuData => ({
      isOpen: false,
      menuItems: [],
      originalPosition: { x: 0, y: 0 },
   });

   private state = $state<FloatingMenuData>(this.resetMenuState());

   getMenuState = (): FloatingMenuData => this.state;

   openMenu(position: Coordinates, menuItems: MenuItem[]) {
      this.state.isOpen = true;
      this.state.menuItems = menuItems;
      this.state.originalPosition = position;
      console.log("Estado del context menu", this.state);
   }

   close() {
      this.state = this.resetMenuState();
   }
}

// Exportamos una única instancia para toda la aplicación
export const contextMenuController = new ContextMenuController();
