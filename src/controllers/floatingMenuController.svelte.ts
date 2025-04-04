import type {
   Coordinates,
   ContextMenuData,
   DropdownMenuData,
   FloatingMenuData,
   RenderItem,
} from "@projectTypes/floatingMenuTypes";
import type { MenuItem, GroupMenuItem } from "@projectTypes/editorMenuTypes";

class FloatingMenuController {
   private startingContextMenuState = (): ContextMenuData => ({
      type: "context",
      isOpen: false,
      menuItems: [],
      originalPosition: { x: 0, y: 0 },
      activeSubMenu: undefined,
      previousFocusedElement: undefined,
   });

   private startingDropdownMenuState = (): DropdownMenuData => ({
      type: "dropdown",
      isOpen: false,
      menuItems: [],
      triggerElement: null,
      activeSubMenu: undefined,
      previousFocusedElement: undefined,
   });

   renderedMainMenu: RenderItem[] = [];
   renderedSubMenu: RenderItem[] = [];

   private state = $state<FloatingMenuData>(this.startingContextMenuState());

   getMenuState = (): FloatingMenuData => this.state;

   openContextMenu(position: Coordinates, menuItems: MenuItem[]) {
      // Guardamos el elemento que tiene el foco antes de abrir el menú
      const previousFocusedElement = document.activeElement as
         | HTMLElement
         | undefined;

      this.state = {
         ...this.startingContextMenuState(),
         isOpen: true,
         menuItems,
         originalPosition: position,
         previousFocusedElement,
      };

      this.renderedSubMenu = [];
      this.renderedMainMenu = [];
   }

   openDropdownMenu(triggerElement: HTMLElement, menuItems: MenuItem[]) {
      // Guardamos el elemento que tiene el foco antes de abrir el menú
      const previousFocusedElement = document.activeElement as
         | HTMLElement
         | undefined;

      this.state = {
         ...this.startingDropdownMenuState(),
         isOpen: true,
         menuItems,
         triggerElement,
         previousFocusedElement,
      };

      this.renderedSubMenu = [];
      this.renderedMainMenu = [];
   }

   closeMenu() {
      this.renderedMainMenu = [];
      this.renderedSubMenu = [];

      if (this.state.previousFocusedElement) {
         this.state.previousFocusedElement.focus();
      }

      // Restablecer el estado según el tipo de menú actual
      if (this.state.type === "context") {
         this.state = this.startingContextMenuState();
      } else {
         this.state = this.startingDropdownMenuState();
      }
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
}

export const floatingMenuController = new FloatingMenuController();
