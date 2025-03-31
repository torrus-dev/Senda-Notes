import type {
   FloatingMenuData,
   MenuItem,
   Coordinates,
} from "@projectTypes/floatingMenuTypes";

class FloatingMenuController {
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
   }

   close() {
      this.state = this.resetMenuState();
   }

   // private getMainMenuPosition(): Coordinates {
   //    if (
   //       !this.isOpen ||
   //       !this.areDimensionsValid(
   //          this.menuDimensions.width,
   //          this.menuDimensions.height,
   //       )
   //    ) {
   //       return this.position;
   //    }

   //    let { x, y } = this.position;
   //    const { width: winWidth, height: winHeight } = this.windowSize;

   //    // Ajuste horizontal
   //    if (x + this.menuDimensions.width > winWidth) {
   //       x =
   //          this.menuType === "context"
   //             ? this.position.x - this.menuDimensions.width
   //             : this.triggerInfo
   //               ? this.triggerInfo.rect.right - this.menuDimensions.width
   //               : x;
   //    }

   //    // Ajuste vertical
   //    if (y + this.menuDimensions.height > winHeight) {
   //       y =
   //          this.menuType === "context"
   //             ? this.position.y - this.menuDimensions.height
   //             : this.triggerInfo
   //               ? this.triggerInfo.rect.top -
   //                 this.menuDimensions.height -
   //                 this.DROPDOWN_MARGIN
   //               : y;
   //    }

   //    return this.constrainToWindow(x, y, this.menuDimensions);
   // }

   // private constrainToWindow(
   //    x: number,
   //    y: number,
   //    dimensions: MenuDimensions,
   // ): Coordinates {
   //    const { width: winWidth, height: winHeight } = this.windowSize;

   //    return {
   //       x: this.clamp(
   //          x,
   //          this.MARGIN_FROM_WINDOW,
   //          winWidth - dimensions.width - this.MARGIN_FROM_WINDOW,
   //       ),
   //       y: this.clamp(
   //          y,
   //          this.MARGIN_FROM_WINDOW,
   //          winHeight - dimensions.height - this.MARGIN_FROM_WINDOW,
   //       ),
   //    };
   // }
}

// Exportamos una única instancia para toda la aplicación
export const floatingMenuController = new FloatingMenuController();
