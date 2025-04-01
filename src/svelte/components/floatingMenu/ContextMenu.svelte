<script lang="ts">
import type { ContextMenuData } from "@projectTypes/floatingMenuTypes";

import { contextMenuController } from "@controllers/floatingMenuController.svelte";
import { closeOnOutsideOrEsc } from "@directives/closeOnOutsideOrEsc";
import {
   createCoordinateReference,
   calculateFloatingPosition,
} from "./floatingPositionUtils";

import { tick } from "svelte";
import Button from "@components/utils/Button.svelte";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-svelte";

let { isOpen, menuItems, originalPosition, activeSubMenu }: ContextMenuData =
   $derived(contextMenuController.getMenuState());

let menuElement = $state<HTMLElement | null>(null);
let positionStyles = $state("left:0; top:0;");

function closeMenu() {
   contextMenuController.close();
}

async function updateMenuPosition() {
   if (!menuElement || !originalPosition) return;

   // Crear una referencia virtual basada en las coordenadas originales
   const reference = createCoordinateReference(
      originalPosition.x,
      originalPosition.y,
   );

   // Calcular la posición usando la utilidad
   const { x, y } = await calculateFloatingPosition(reference, menuElement, {
      placement: "bottom-start",
      offsetValue: 0,
      padding: 5,
      fallbackPlacements: ["top-start"],
   });

   positionStyles = `left:${x}px; top:${y}px;`;
}

$effect(() => {
   if (isOpen === true && originalPosition) {
      tick().then(updateMenuPosition);
   }
});
</script>

{#snippet separatorItem()}
   <li class="border-border-normal my-1 w-full border-t-2" role="separator">
   </li>
{/snippet}
{#snippet actionItem()}
{/snippet}


{#if isOpen && menuItems && menuItems.length > 0 && originalPosition}
   <div
      class="absolute z-100"
      style={positionStyles}
      bind:this={menuElement}
      use:closeOnOutsideOrEsc={closeMenu}>
      <ul
         class="rounded-field outlined bg-base-200 flex min-w-48 flex-col p-1 shadow-xl">
         {#if activeSubMenu === undefined}
            {#each menuItems as menuItem}
               {#if menuItem.type === "separator"}
                  {@render separatorItem()}
               {:else if menuItem.type === "action"}
                  <li>
                     <Button
                        size="small"
                        cssClass="w-full {menuItem.class}"
                        onclick={() => {
                           menuItem.onClick?.();
                           closeMenu();
                        }}>
                        <menuItem.icon size="1.0625rem" />
                        {menuItem.label}
                     </Button>
                  </li>
               {:else if menuItem.type === "group"}
                  <li>
                     <Button
                        size="small"
                        cssClass="w-full justify-between {menuItem.class}"
                        onclick={() => {
                           contextMenuController.setActiveSubMenu(menuItem);
                        }}>
                        <span class="flex items-center gap-2">
                           <menuItem.icon size="1.0625rem" />
                           {menuItem.label}
                        </span>
                        <ChevronRightIcon size="1.0625rem" />
                     </Button>
                  </li>
               {/if}
            {/each}
         {:else}
            <li>
               <Button
                  size="small"
                  onclick={contextMenuController.unsetActiveSubMenu}
                  cssClass="w-full">
                  <ChevronLeftIcon size="1.0625rem"></ChevronLeftIcon>
                  <span class="flex items-center gap-2">
                     <activeSubMenu.icon size="1.0625rem" />
                     {activeSubMenu.label}
                  </span>
               </Button>
            </li>
            {@render separatorItem()}
            {#each activeSubMenu.children as subMenuItem}
               {#if subMenuItem.type === "separator"}
                  {@render separatorItem()}
               {:else if subMenuItem.type === "action"}
                  <li>
                     <Button
                        size="small"
                        cssClass="w-full {subMenuItem.class}"
                        onclick={() => {
                           subMenuItem.onClick?.();
                           closeMenu();
                        }}>
                        <subMenuItem.icon size="1.0625rem" />
                        {subMenuItem.label}
                     </Button>
                  </li>
               {/if}
            {/each}
         {/if}
      </ul>
   </div>
{/if}
