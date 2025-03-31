<script lang="ts">
import { floatingMenuController } from "@controllers/contextMenuController.svelte";
import { tick, onDestroy } from "svelte";
import Menu from "./Menu.svelte";
import {
   Coordinates,
   Dimensions,
   FloatingMenuData,
} from "@projectTypes/floatingMenuTypes";

import { calculateMenuCoordinates } from "@utils/floatingMenuUtils";

let { isOpen, menuItems, originalPosition }: FloatingMenuData = $derived(
   floatingMenuController.getMenuState(),
);

let updatedPosition = $state<Coordinates | null>(null);

let menuElement = $state<HTMLElement | null>(null);

$effect(() => {
   if (isOpen && originalPosition) {
      tick().then(() => {
         if (menuElement) {
            const elementRect: DOMRect = menuElement.getBoundingClientRect();
            const menuDimensions: Dimensions = {
               width: elementRect.width,
               height: elementRect.height,
            };
            updatedPosition = calculateMenuCoordinates(
               originalPosition,
               menuDimensions,
            );
         } else {
            console.error("no se pudo obtener las dimensiones del elemento");
         }
      });
   }
});
let menuDimensions;
console.log();
</script>

{#if isOpen && menuItems && originalPosition}
   <div class="absolute bg-red-500" style="" bind:this={menuElement}>
      <Menu menuItems={menuItems} />
   </div>
{/if}
