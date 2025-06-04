import { MediaQuery } from "svelte/reactivity";
import type { Dimensions } from "@projectTypes/floatingTypes";

class ScreenSizeController {
   private windowSize = $state<Dimensions>({
      width: window.innerWidth,
      height: window.innerHeight,
   });

   private setWindowsSize = (newDimensions: Dimensions) => {
      this.windowSize = newDimensions;
   };

   constructor() {
      // evento para actualizar propiedad windowsSize
      if (typeof window !== "undefined") {
         window.addEventListener("resize", () =>
            this.setWindowsSize({
               width: window.innerWidth,
               height: window.innerHeight,
            }),
         );
      }
   }

   readonly MOBILE_MAX_SIZE = 640;
   readonly TABLET_MIN_SIZE = 641;
   readonly TABLET_MAX_SIZE = 768;
   readonly DESKTOP_MIN_SIZE = 769;

   private checkIsMobile = new MediaQuery(
      `max-width: ${this.MOBILE_MAX_SIZE}px`,
   );
   private checkIsTablet = new MediaQuery(
      `min-width: ${this.TABLET_MIN_SIZE}px and max-width: ${this.TABLET_MAX_SIZE}px`,
   );
   private checkIsDesktop = new MediaQuery(
      `min-width: ${this.DESKTOP_MIN_SIZE}px`,
   );

   // These properties will automatically update when the screen size changes
   isMobile: boolean = $derived(this.checkIsMobile.current);
   isTablet: boolean = $derived(this.checkIsTablet.current);
   isDesktop: boolean = $derived(this.checkIsDesktop.current);
   getWindowSize = (): Dimensions => this.windowSize;
}

export const screenSizeController = $state(new ScreenSizeController());
