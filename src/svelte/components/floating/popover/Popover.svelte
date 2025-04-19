<script lang="ts">
import { type Snippet, tick } from "svelte";
import { calculateFloatingPosition } from "@utils/floatingPositionUtils";

// Props con valores por defecto
let {
   isOpen,
   children,
   styles = "",
   htmlElement,
   placement = "bottom",
   showOnHover = false,
   hoverDelay = 500,
}: {
   isOpen: boolean;
   children: Snippet;
   styles?: string;
   htmlElement: HTMLElement;
   placement?: "top" | "right" | "bottom" | "left";
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

// Función para posicionar el popover mejorada
async function updatePopoverPosition() {
   if (!popoverElement || !htmlElement) return;

   // Convertir placement simple a notación de FloatingUI
   const floatingPlacement =
      placement === "top" || placement === "bottom"
         ? placement
         : `${placement}-center`;

   const fallbackPlacement = OPPOSITE_POSITIONS[placement] as any;

   const { x, y } = await calculateFloatingPosition(
      htmlElement,
      popoverElement,
      {
         placement: floatingPlacement as any,
         offsetValue: 10,
         padding: 5,
         fallbackPlacements: [fallbackPlacement],
      },
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
      class="bg-base-400 rounded-field absolute z-90 p-2 shadow {styles}"
      onmouseenter={handlePopoverMouseEnter}
      onmouseleave={handlePopoverMouseLeave}>
      {@render children()}
   </div>
{/if}
