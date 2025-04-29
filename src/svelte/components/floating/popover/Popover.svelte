<script lang="ts">
import { type Snippet, tick } from "svelte";
import {
   calculateFloatingPosition,
   type PositioningOptions,
} from "@utils/floatingPositionUtils";
import type { Placement } from "@floating-ui/dom";

// Definimos los tipos para el posicionamiento
type MainPlacement = "top" | "right" | "bottom" | "left";
type Alignment = "start" | "center" | "end";

// Props con valores por defecto
let {
   isOpen,
   children,
   class: styles = "",
   htmlElement,
   placement = "bottom",
   alignment = "center",
   showOnHover = false,
   hoverDelay = 500,
}: {
   isOpen: boolean;
   children: Snippet;
   class?: string;
   htmlElement: HTMLElement;
   placement?: MainPlacement;
   alignment?: Alignment;
   showOnHover?: boolean;
   hoverDelay?: number;
} = $props();

// Estado del componente
let popoverElement: HTMLElement | undefined = $state();
let popoverPosition = $state({ x: 0, y: 0 });
let hovered = $state(false);
let timerId: ReturnType<typeof setTimeout> | null = null;
let resizeObserver: ResizeObserver | null = null;

// Mapa de posiciones opuestas para fallbacks
const OPPOSITE_POSITIONS = {
   top: "bottom",
   right: "left",
   bottom: "top",
   left: "right",
} as const;

// Función para obtener el placement completo para FloatingUI
function getPlacement(): Placement {
   if (alignment === "center") {
      return placement;
   }
   return `${placement}-${alignment}` as Placement;
}

// Función para posicionar el popover mejorada
async function updatePopoverPosition() {
   if (!popoverElement || !htmlElement) return;

   // Obtener el placement completo
   const placement = getPlacement();

   // Crear fallbacks basados en la posición principal y alineación
   const oppositePlacement = OPPOSITE_POSITIONS[
      placement as MainPlacement
   ] as MainPlacement;

   // Crear fallback que mantiene la alineación pero cambia el eje principal
   const fallbackPlacement =
      alignment === "center"
         ? oppositePlacement
         : (`${oppositePlacement}-${alignment}` as Placement);

   const positioningOptions: PositioningOptions = {
      placement,
      offsetValue: 4,
      padding: 2,
      fallbackPlacements: [fallbackPlacement],
   };

   const { x, y } = await calculateFloatingPosition(
      htmlElement,
      popoverElement,
      positioningOptions,
   );

   popoverPosition = { x, y };

   // Aplicar posición
   if (popoverElement) {
      popoverElement.style.left = `${x}px`;
      popoverElement.style.top = `${y}px`;
   }
}

// Funciones simplificadas para manejo de hover
function startOpenTimer() {
   if (timerId) clearTimeout(timerId);
   timerId = setTimeout(() => (isOpen = true), hoverDelay);
}

function scheduleClose(delay = 200) {
   setTimeout(() => {
      if (!hovered) isOpen = false;
   }, delay);
}

// Gestores de eventos
function handleTargetMouseEnter() {
   if (!showOnHover) return;
   hovered = true;
   startOpenTimer();
}

function handleTargetMouseLeave() {
   if (!showOnHover) return;
   hovered = false;
   if (timerId) {
      clearTimeout(timerId);
      timerId = null;
   }
   scheduleClose();
}

function handlePopoverMouseEnter() {
   if (showOnHover) hovered = true;
}

function handlePopoverMouseLeave() {
   if (showOnHover) {
      hovered = false;
      scheduleClose(100);
   }
}

// Configuración y limpieza de eventos hover
$effect.root(() => {
   if (!showOnHover || !htmlElement) return;

   htmlElement.addEventListener("mouseenter", handleTargetMouseEnter);
   htmlElement.addEventListener("mouseleave", handleTargetMouseLeave);

   return () => {
      htmlElement.removeEventListener("mouseenter", handleTargetMouseEnter);
      htmlElement.removeEventListener("mouseleave", handleTargetMouseLeave);
      if (timerId) clearTimeout(timerId);
   };
});

// Configuración del ResizeObserver
$effect.root(() => {
   if (!htmlElement) return;

   // Crear un observer para detectar cambios en el tamaño del elemento referencia
   resizeObserver = new ResizeObserver(() => {
      if (isOpen) updatePopoverPosition();
   });

   resizeObserver.observe(htmlElement);

   return () => {
      if (resizeObserver) {
         resizeObserver.disconnect();
         resizeObserver = null;
      }
   };
});

// Efecto para posicionar el popover cuando se abre
$effect(() => {
   if (isOpen) {
      tick().then(updatePopoverPosition);
   }
});
</script>

{#if isOpen}
   <div
      bind:this={popoverElement}
      role="tooltip"
      class="rounded-field absolute z-90 shadow {styles}"
      onmouseenter={handlePopoverMouseEnter}
      onmouseleave={handlePopoverMouseLeave}>
      {@render children()}
   </div>
{/if}
