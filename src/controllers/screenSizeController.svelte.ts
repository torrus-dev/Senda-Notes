import { MediaQuery } from "svelte/reactivity";

class ScreenSizeController {
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
}

export const screenSizeController = $state(new ScreenSizeController());
