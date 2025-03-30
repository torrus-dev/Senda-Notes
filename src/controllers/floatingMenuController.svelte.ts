import type {
   MenuItem,
   Coordinates,
   TriggerInfo,
   SubMenuState,
} from "@projectTypes/contextMenuTypes";
import { workspace } from "@controllers/workspaceController.svelte";

type MenuDimensions = { width: number; height: number };

class FloatingMenuController {
   // Estados principales
   menuType = $state<"dropdown" | "context" | null>(null);
   isOpen = $state<boolean>(false);
   position = $state<Coordinates>({ x: 0, y: 0 });
   menuItems = $state<MenuItem[]>([]);
   triggerInfo = $state<TriggerInfo | null>(null);
   menuDimensions = $state<MenuDimensions>({ width: 0, height: 0 });
   initialRender = $state<boolean>(true);

   // Estado del submenú
   subMenu = $state<SubMenuState>({
      isOpen: false,
      parentItemIndex: -1,
      items: [],
      position: { x: 0, y: 0 },
      dimensions: { width: 0, height: 0 },
      initialRender: true,
   });

   // Valores derivados
   windowSize = $derived(workspace.windowSize);

   // Constantes
   readonly DROPDOWN_MARGIN = 4;
   readonly SUBMENU_OFFSET = 2;
   readonly MARGIN_FROM_WINDOW = 5;

   constructor() {
      if (typeof window !== "undefined") {
         window.addEventListener("resize", this.handleWindowResize);
      }
   }

   destroy() {
      if (typeof window !== "undefined") {
         window.removeEventListener("resize", this.handleWindowResize);
      }
   }

   // ==== Métodos de gestión de estado general ====
   close() {
      this.closeSubMenu();
      this.resetState();
   }

   private resetState() {
      this.menuType = null;
      this.isOpen = false;
      this.menuItems = [];
      this.triggerInfo = null;
      this.menuDimensions = { width: 0, height: 0 };
      this.initialRender = true;
   }

   // ==== Métodos para el menú principal ====
   openContextMenu(position: Coordinates, menuItems: MenuItem[]) {
      this.menuType = "context";
      this.position = position;
      this.triggerInfo = null;
      this.menuItems = menuItems;
      this.isOpen = true;
      this.resetMenuUI();
   }

   openDropdownMenu(triggerElement: HTMLElement, menuItems: MenuItem[]) {
      const rect = triggerElement.getBoundingClientRect();

      this.menuType = "dropdown";
      this.triggerInfo = { element: triggerElement, rect };
      this.position = {
         x: rect.left,
         y: rect.bottom + this.DROPDOWN_MARGIN,
      };
      this.menuItems = menuItems;
      this.isOpen = true;
      this.resetMenuUI();
   }

   private resetMenuUI() {
      this.menuDimensions = { width: 0, height: 0 };
      this.initialRender = true;
   }

   setMenuDimensions(width: number, height: number) {
      if (
         this.areDimensionsValid(width, height) &&
         this.areDimensionsDifferent(width, height, this.menuDimensions)
      ) {
         this.menuDimensions = { width, height };
         this.initialRender = false;
      }
   }

   // ==== Métodos para submenús ====
   openSubMenu(parentElement: HTMLElement, parentItemIndex: number) {
      if (!this.isOpen || !this.isValidIndex(parentItemIndex)) return;

      const parentItem = this.menuItems[parentItemIndex];

      // Comprobación TypeScript-safe
      if (!this.hasSubmenu(parentItem)) return;

      const parentRect = parentElement.getBoundingClientRect();

      this.subMenu.parentItemIndex = parentItemIndex;
      if (
         !("children" in parentItem) ||
         !parentItem.children ||
         parentItem.children.length === 0
      ) {
         return;
      }
      this.subMenu.items = parentItem.children!;
      this.subMenu.position = {
         x: parentRect.right + this.SUBMENU_OFFSET,
         y: parentRect.top,
      };
      this.subMenu.dimensions = { width: 0, height: 0 };
      this.subMenu.initialRender = true;
      this.subMenu.isOpen = true;
   }

   closeSubMenu() {
      this.subMenu.isOpen = false;
      this.subMenu.parentItemIndex = -1;
      this.subMenu.items = [];
      this.subMenu.dimensions = { width: 0, height: 0 };
      this.subMenu.initialRender = true;
   }

   setSubMenuDimensions(width: number, height: number) {
      if (
         this.areDimensionsValid(width, height) &&
         this.areDimensionsDifferent(width, height, this.subMenu.dimensions)
      ) {
         this.subMenu.dimensions = { width, height };
         this.subMenu.initialRender = false;
      }
   }

   updateSubMenuPosition() {
      if (
         !this.subMenu.isOpen ||
         !this.isValidIndex(this.subMenu.parentItemIndex)
      )
         return;

      const parentItems = document.querySelectorAll("#context-menu > li");
      if (parentItems.length <= this.subMenu.parentItemIndex) return;

      const parentRect =
         parentItems[this.subMenu.parentItemIndex].getBoundingClientRect();
      this.subMenu.position = {
         x: parentRect.right + this.SUBMENU_OFFSET,
         y: parentRect.top,
      };
   }

   // ==== Métodos de posicionamiento ====
   getAdaptedPosition(isSubMenu = false): Coordinates {
      return isSubMenu ? this.getSubMenuPosition() : this.getMainMenuPosition();
   }

   private getMainMenuPosition(): Coordinates {
      if (
         !this.isOpen ||
         !this.areDimensionsValid(
            this.menuDimensions.width,
            this.menuDimensions.height,
         )
      ) {
         return this.position;
      }

      let { x, y } = this.position;
      const { width: winWidth, height: winHeight } = this.windowSize;

      // Ajuste horizontal
      if (x + this.menuDimensions.width > winWidth) {
         x =
            this.menuType === "context"
               ? this.position.x - this.menuDimensions.width
               : this.triggerInfo
                 ? this.triggerInfo.rect.right - this.menuDimensions.width
                 : x;
      }

      // Ajuste vertical
      if (y + this.menuDimensions.height > winHeight) {
         y =
            this.menuType === "context"
               ? this.position.y - this.menuDimensions.height
               : this.triggerInfo
                 ? this.triggerInfo.rect.top -
                   this.menuDimensions.height -
                   this.DROPDOWN_MARGIN
                 : y;
      }

      return this.constrainToWindow(x, y, this.menuDimensions);
   }

   private getSubMenuPosition(): Coordinates {
      if (
         !this.subMenu.isOpen ||
         !this.areDimensionsValid(
            this.subMenu.dimensions.width,
            this.subMenu.dimensions.height,
         )
      ) {
         return this.subMenu.position;
      }

      let { x, y } = this.subMenu.position;
      const { width: winWidth, height: winHeight } = this.windowSize;

      // Ajuste horizontal - mostrar a la izquierda si no cabe a la derecha
      if (x + this.subMenu.dimensions.width > winWidth) {
         const parentItems = document.querySelectorAll("#context-menu > li");
         if (parentItems.length > this.subMenu.parentItemIndex) {
            const parentRect =
               parentItems[
                  this.subMenu.parentItemIndex
               ].getBoundingClientRect();
            x =
               parentRect.left -
               this.subMenu.dimensions.width -
               this.SUBMENU_OFFSET;
         }
      }

      // Ajuste vertical
      if (y + this.subMenu.dimensions.height > winHeight) {
         y =
            winHeight -
            this.subMenu.dimensions.height -
            this.MARGIN_FROM_WINDOW;
      }

      return this.constrainToWindow(x, y, this.subMenu.dimensions);
   }

   private constrainToWindow(
      x: number,
      y: number,
      dimensions: MenuDimensions,
   ): Coordinates {
      const { width: winWidth, height: winHeight } = this.windowSize;

      return {
         x: this.clamp(
            x,
            this.MARGIN_FROM_WINDOW,
            winWidth - dimensions.width - this.MARGIN_FROM_WINDOW,
         ),
         y: this.clamp(
            y,
            this.MARGIN_FROM_WINDOW,
            winHeight - dimensions.height - this.MARGIN_FROM_WINDOW,
         ),
      };
   }

   // ==== Métodos de utilidad ====
   private handleWindowResize = () => {
      if (!this.isOpen || this.menuDimensions.width <= 0) return;

      if (this.triggerInfo?.element) {
         this.updateTriggerPosition();
      }

      if (this.subMenu.isOpen) {
         this.updateSubMenuPosition();
      }
   };

   private updateTriggerPosition() {
      if (!this.triggerInfo?.element) return;

      this.triggerInfo = {
         element: this.triggerInfo.element,
         rect: this.triggerInfo.element.getBoundingClientRect(),
      };

      this.position = {
         x: this.triggerInfo.rect.left,
         y:
            this.menuType === "dropdown"
               ? this.triggerInfo.rect.bottom + this.DROPDOWN_MARGIN
               : this.triggerInfo.rect.bottom,
      };
   }

   private hasSubmenu(item: MenuItem): boolean {
      return (
         "children" in item &&
         item.children !== undefined &&
         item.children !== null &&
         item.children.length > 0
      );
   }

   private isValidIndex(index: number): boolean {
      return index >= 0 && index < this.menuItems.length;
   }

   private clamp(value: number, min: number, max: number): number {
      return Math.min(Math.max(value, min), max);
   }

   private areDimensionsValid(width: number, height: number): boolean {
      return width > 0 && height > 0;
   }

   private areDimensionsDifferent(
      width: number,
      height: number,
      current: MenuDimensions,
   ): boolean {
      return width !== current.width || height !== current.height;
   }
}

// Exportamos una única instancia para toda la aplicación
export const floatingMenuController = new FloatingMenuController();
