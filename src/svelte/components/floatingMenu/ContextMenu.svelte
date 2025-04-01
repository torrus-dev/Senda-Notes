<script lang="ts">
import type {
   ActionMenuItem,
   ContextMenuData,
   GroupMenuItem,
} from "@projectTypes/floatingMenuTypes";

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
   if (isOpen && activeSubMenu !== undefined) {
      tick().then(updateMenuPosition);
   }
});
</script>

{#snippet separatorItem()}
   <li class="border-border-normal my-1 w-full border-t-2" role="separator">
   </li>
{/snippet}
{#snippet actionItem(menuItem: ActionMenuItem)}
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
{/snippet}
{#snippet groupItem(
   menuItem: GroupMenuItem,
   arrowLeft: boolean = false,
   onclick: () => void,
)}
   <li>
      <Button size="small" cssClass="w-full {menuItem.class}" onclick={onclick}>
         {#if arrowLeft}
            <ChevronLeftIcon size="1.0625rem" class="absolute left-2" />
         {/if}
         <span
            class="flex flex-1 items-center gap-2
            {arrowLeft ? 'justify-center' : ''}">
            {#if menuItem.icon}
               <menuItem.icon size="1.0625rem" />
            {/if}
            {menuItem.label}
         </span>
         {#if !arrowLeft}
            <ChevronRightIcon size="1.0625rem" />
         {/if}
      </Button>
   </li>
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
                  {@render actionItem(menuItem)}
               {:else if menuItem.type === "group"}
                  {@render groupItem(menuItem, false, () => {
                     contextMenuController.setActiveSubMenu(menuItem);
                  })}
               {/if}
            {/each}
         {:else}
            {@render groupItem(
               activeSubMenu,
               true,
               contextMenuController.unsetActiveSubMenu,
            )}
            {@render separatorItem()}
            {#each activeSubMenu.children as subMenuItem}
               {#if subMenuItem.type === "separator"}
                  {@render separatorItem()}
               {:else if subMenuItem.type === "action"}
                  {@render actionItem(subMenuItem)}
               {/if}
            {/each}
         {/if}
      </ul>
   </div>
{/if}
