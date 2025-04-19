<style>
.popover {
   position: absolute;
   z-index: 1000;
   background-color: white;
   border-radius: 4px;
   box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
   max-width: 300px;
   padding: 8px;
   box-sizing: border-box;
}
</style>

<script lang="ts">
import { type Snippet, tick } from "svelte";
import { calculateFloatingPosition } from "@utils/floatingPositionUtils";

let {
   isOpen,
   children,
   styles,
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

let popoverElement: HTMLElement | undefined = $state();
let timerId: ReturnType<typeof setTimeout> | null = null;
let popoverPosition = { x: 0, y: 0 };
let hovered = false;

// Función para posicionar el popover
async function positionPopover() {
   if (!popoverElement || !htmlElement) return;

   // Transformar el placement simple a la notación de FloatingUI
   const floatingPlacement =
      placement === "top" || placement === "bottom"
         ? `${placement}`
         : `${placement}-start`;

   const { x, y } = await calculateFloatingPosition(
      htmlElement,
      popoverElement,
      {
         placement: floatingPlacement as any,
         offsetValue: 10,
         padding: 5,
         fallbackPlacements: [getOppositePosition(placement) as any],
      },
   );

   popoverPosition = { x, y };

   // Aplicar la posición calculada
   popoverElement.style.left = `${x}px`;
   popoverElement.style.top = `${y}px`;
}

// Función para obtener la posición opuesta para el fallback
function getOppositePosition(pos: string): string {
   const opposites: { [key: string]: string } = {
      top: "bottom",
      right: "left",
      bottom: "top",
      left: "right",
   };
   return opposites[pos] || "bottom";
}

// Gestionar eventos de ratón si showOnHover está activo
function handleMouseEnter() {
   if (!showOnHover) return;

   hovered = true;
   if (timerId) clearTimeout(timerId);

   timerId = setTimeout(() => {
      isOpen = true;
   }, hoverDelay);
}

function handleMouseLeave() {
   if (!showOnHover) return;

   hovered = false;
   if (timerId) {
      clearTimeout(timerId);
      timerId = null;
   }

   // Dar un pequeño tiempo antes de cerrar para permitir
   // que el usuario mueva el cursor al popover
   setTimeout(() => {
      if (!hovered) isOpen = false;
   }, 200);
}

// Manejar el evento de mouse enter en el popover
function handlePopoverMouseEnter() {
   if (showOnHover) hovered = true;
}

// Manejar el evento de mouse leave en el popover
function handlePopoverMouseLeave() {
   if (showOnHover) {
      hovered = false;
      setTimeout(() => {
         if (!hovered) isOpen = false;
      }, 100);
   }
}

// Añadir/eliminar eventos según sea necesario
$effect.root(() => {
   if (showOnHover && htmlElement) {
      htmlElement.addEventListener("mouseenter", handleMouseEnter);
      htmlElement.addEventListener("mouseleave", handleMouseLeave);

      return () => {
         htmlElement.removeEventListener("mouseenter", handleMouseEnter);
         htmlElement.removeEventListener("mouseleave", handleMouseLeave);
         if (timerId) clearTimeout(timerId);
      };
   }
});

$effect.root(() => {
   $effect(() => {
      if (isOpen) {
         tick().then(() => {
            positionPopover();
         });
      }
   });
});
</script>

{#if isOpen}
   <div
      bind:this={popoverElement}
      role="tooltip"
      class=" bg-base-300 {'popover ' + (styles || '')}"
      onmouseenter={handlePopoverMouseEnter}
      onmouseleave={handlePopoverMouseLeave}>
      {@render children()}
   </div>
{/if}
