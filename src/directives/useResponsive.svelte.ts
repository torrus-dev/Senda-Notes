// Hook para gestionar el estado responsive
import { get } from "http";
import { onMount, onDestroy } from "svelte";

export function useResponsive() {
   // Breakpoints de Tailwind
   const MOBILE_BREAKPOINT = 640; // sm
   const TABLET_BREAKPOINT = 768; // md
   const DESKTOP_BREAKPOINT = 1024; // lg

   let getWindowWidth = () =>
      typeof window !== "undefined" ? window.innerWidth : 0;

   let windowWidth = $state(getWindowWidth());

   function updateViewport() {
      windowWidth = window.innerWidth;
   }

   // Valores reactivos derivados
   let isMobile = $derived(getWindowWidth() < MOBILE_BREAKPOINT);
   let isTablet = $derived(
      getWindowWidth() >= MOBILE_BREAKPOINT &&
         getWindowWidth() < DESKTOP_BREAKPOINT,
   );
   let isDesktop = $derived(getWindowWidth() >= DESKTOP_BREAKPOINT);

   if (typeof window !== "undefined") {
      onMount(() => {
         updateViewport();
         window.addEventListener("resize", updateViewport);

         return () => {
            window.removeEventListener("resize", updateViewport);
         };
      });
   }

   return { isMobile, isTablet, isDesktop };
}
