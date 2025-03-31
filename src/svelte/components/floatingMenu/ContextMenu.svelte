<script lang="ts">
import { contextMenuController } from "@controllers/contextMenuController.svelte";
import { tick, onDestroy } from "svelte";
import Menu from "./Menu.svelte";
import type {
   Coordinates,
   Dimensions,
   FloatingMenuData,
} from "@projectTypes/floatingMenuTypes";

import { calculateContextMenuCoordinates } from "@utils/floatingMenuUtils";
import Button from "@components/utils/Button.svelte";
import { closeOnOutsideOrEsc } from "@directives/closeOnOutsideOrEsc";

let { isOpen, menuItems, originalPosition }: FloatingMenuData = $derived(
   contextMenuController.getMenuState(),
);
let updatedPosition = $state<Coordinates | null>(null);
let menuElement = $state<HTMLElement | null>(null);
let isPositioned = $state<boolean>(false);

$effect(() => {
   if (isOpen && originalPosition) {
      tick().then(() => {
         if (menuElement) {
            console.log(menuElement);

            const elementRect: DOMRect = menuElement.getBoundingClientRect();
            const menuDimensions: Dimensions = {
               width: elementRect.width,
               height: elementRect.height,
            };
            updatedPosition = calculateContextMenuCoordinates(
               originalPosition,
               menuDimensions,
            );
            isPositioned = true;
         } else {
            console.error("no se pudo obtener las dimensiones del elemento");
         }
      });
   }
});
</script>

{#if isOpen && menuItems && originalPosition}
   <div
      class="
         absolute z-100
         {isPositioned ? '' : 'opacity-0'}
      "
      style={updatedPosition
         ? `left:${updatedPosition.x}px; top:${updatedPosition.y}px;`
         : "left:0; top:0"}
      bind:this={menuElement}>
      {#if menuItems && menuItems.length > 0}
         <ul
            class="rounded-field outlined bg-base-200 flex flex-col p-1 shadow-xl"
            use:closeOnOutsideOrEsc={() => contextMenuController.close()}>
            {#each menuItems as menuItem, index}
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
                        <menuItem.icon size="1.0625rem" />{menuItem.label}
                     </Button>
                  </li>
               {/if}
            {/each}
         </ul>
      {/if}
   </div>
{/if}
