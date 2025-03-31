<script lang="ts">
import type { FloatingMenuData } from "@projectTypes/floatingMenuTypes";

import { contextMenuController } from "@controllers/contextMenuController.svelte";
import { computePosition, offset, flip, shift } from "@floating-ui/dom";
import Button from "@components/utils/Button.svelte";
import { closeOnOutsideOrEsc } from "@directives/closeOnOutsideOrEsc";

import { tick } from "svelte";

let { isOpen, menuItems, originalPosition }: FloatingMenuData = $derived(
   contextMenuController.getMenuState(),
);
let menuElement = $state<HTMLElement | null>(null);
let positionStyles = $state("left:0; top:0;");

// Virtual reference: un rectángulo de 1x1 en originalPosition
const virtualReference = {
   getBoundingClientRect() {
      return {
         x: originalPosition?.x || 0,
         y: originalPosition?.y || 0,
         width: 1,
         height: 1,
         top: originalPosition?.y || 0,
         left: originalPosition?.x || 0,
         right: (originalPosition?.x || 0) + 1,
         bottom: (originalPosition?.y || 0) + 1,
      };
   },
};

$effect(() => {
   if (isOpen && originalPosition) {
      tick().then(async () => {
         if (menuElement && originalPosition) {
            const { x, y } = await computePosition(
               virtualReference,
               menuElement,
               {
                  placement: "bottom-start", // posición por defecto: abajo y a la derecha
                  middleware: [
                     offset(0), // sin desplazamiento adicional; puedes ajustar si lo deseas
                     flip({ fallbackPlacements: ["top-start"] }), // si no cabe abajo, se posiciona arriba
                     shift({ padding: 5 }), // evita que se desborde; padding opcional
                  ],
               },
            );
            positionStyles = `left:${x}px; top:${y}px;`;
         }
      });
   }
});
</script>

{#if isOpen && menuItems && originalPosition}
   <!-- Menú contextual -->
   <div class="absolute z-100" style={positionStyles} bind:this={menuElement}>
      {#if menuItems.length > 0}
         <ul
            class="rounded-field outlined bg-base-200 flex flex-col p-1 shadow-xl"
            use:closeOnOutsideOrEsc={() => contextMenuController.close()}>
            {#each menuItems as menuItem}
               {#if "separator" in menuItem && menuItem.separator}
                  <li
                     class="border-border-normal my-1 w-full border-t-2"
                     role="separator">
                  </li>
               {:else if "label" in menuItem && menuItem.label}
                  <li>
                     <Button
                        size="small"
                        cssClass="w-full"
                        onclick={menuItem.onClick}>
                        <menuItem.icon size="1.0625rem" />
                        {menuItem.label}
                     </Button>
                  </li>
               {/if}
            {/each}
         </ul>
      {/if}
   </div>
{/if}
