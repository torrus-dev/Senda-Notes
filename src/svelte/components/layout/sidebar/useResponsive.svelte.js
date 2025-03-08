// Hook para gestionar el estado responsive
import { onMount, onDestroy } from "svelte";

export function useResponsive() {
  // Breakpoints de Tailwind
  const MOBILE_BREAKPOINT = 640; // sm
  const TABLET_BREAKPOINT = 768; // md
  const DESKTOP_BREAKPOINT = 1024; // lg

  let windowWidth = $state(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  function updateViewport() {
    windowWidth = window.innerWidth;
    console.log("width", windowWidth);
  }

  // Valores reactivos derivados
  let isMobile = $derived(windowWidth < MOBILE_BREAKPOINT);
  let isTablet = $derived(
    windowWidth >= MOBILE_BREAKPOINT && windowWidth < DESKTOP_BREAKPOINT,
  );
  let isDesktop = $derived(windowWidth >= DESKTOP_BREAKPOINT);

  if (typeof window !== "undefined") {
    onMount(() => {
      updateViewport();
      window.addEventListener("resize", updateViewport);

      return () => {
        window.removeEventListener("resize", updateViewport);
      };
    });
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
  };
}
