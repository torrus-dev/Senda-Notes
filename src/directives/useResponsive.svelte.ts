// Hook para gestionar el estado responsive
import { MediaQuery } from "svelte/reactivity";

export interface ScreenSizes {
   isMobile: boolean;
   isTablet: boolean;
   isDesktop: boolean;
}

export function useResponsive() {
   // Breakpoints de Tailwind
   const MOBILE_MAX_SIZE = 640; // sm
   const TABLET_MIN_SIZE = 641; // md
   const TABLET_MAX_SIZE = 768; // md
   const DESKTOP_MIN_SIZE = 769; // md
   // const DESKTOP_BREAKPOINT = 1024; // lg

   const isMobile = $derived(new MediaQuery(`max-width: ${MOBILE_MAX_SIZE}px`));
   const isTablet = $derived(
      new MediaQuery(
         `min-width: ${TABLET_MIN_SIZE}px and max-width: ${TABLET_MAX_SIZE}px`,
      ),
   );
   const isDesktop = $derived(
      new MediaQuery(`min-width: ${DESKTOP_MIN_SIZE}px`),
   );

   return { isMobile, isTablet, isDesktop };
}
