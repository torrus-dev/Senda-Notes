import type {
   Coordinates,
   ContextMenuData,
   DropdownMenuData,
   FloatingMenuData,
   RenderItem,
   BaseMenuData,
} from "@projectTypes/floatingMenuTypes";
import type { MenuItem, GroupMenuItem } from "@projectTypes/editorMenuTypes";

class FloatingMenuController {

   private startingFloatingMenuState = (): BaseMenuData => ({
      type: undefined,
      isOpen: false,
      menuItems: [],
      triggerElement: undefined,
      activeSubMenu: undefined,
      previousFocusedElement: undefined,
   });

   renderedMainMenu: RenderItem[] = [];
   renderedSubMenu: RenderItem[] = [];

   private state = $state<FloatingMenuData>(this.startingFloatingMenuState());

   getMenuState = (): FloatingMenuData => this.state;

   openContextMenu(position: Coordinates, menuItems: MenuItem[]) {
      // Guardamos el elemento que tiene el foco antes de abrir el menú
      const previousFocusedElement = document.activeElement as
         | HTMLElement
         | undefined;

      this.state = {
         ...this.startingFloatingMenuState(),
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
      }
      if (this.state.type === "dropdown") {
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
   getTriggerElement = (): HTMLElement | undefined => {
      if (this.state.type === "dropdown") {
         console.log("get dropdown", this.state.triggerElement);
         return this.state.triggerElement;
      } else {
         return undefined;
      }
   };
}

export const floatingMenuController = new FloatingMenuController();
