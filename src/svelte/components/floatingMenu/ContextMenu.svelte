<script lang="ts">
import type { ContextMenuData } from "@projectTypes/floatingMenuTypes";

import { contextMenuController } from "@controllers/floatingMenuController.svelte";
import { onOutsideOrEsc } from "@directives/onOutsideOrEsc";
import { setupKeyboardNavigation } from "./keyboardNavigation";

import {
   createCoordinateReference,
   calculateFloatingPosition,
} from "./floatingPositionUtils";

import { tick } from "svelte";
import ActionMenuItem from "./menuItems/ActionMenuItem.svelte";
import GroupMenuItem from "./menuItems/GroupMenuItem.svelte";
import SeparatorMenuItem from "./menuItems/SeparatorMenuItem.svelte";

let { isOpen, menuItems, originalPosition, activeSubMenu }: ContextMenuData =
   $derived(contextMenuController.getMenuState());
let menuElement = $state<HTMLElement | null>(null);
let positionStyles = $state("left:0; top:0;");

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

let removeKeyboardNavigation = $state<any>(undefined);
$effect(() => {
   if (isOpen === true) {
      if (originalPosition) {
         tick().then(updateMenuPosition);
         if (menuElement) {
            removeKeyboardNavigation = setupKeyboardNavigation(menuElement);
         }
      }
      if (activeSubMenu !== undefined) {
         tick().then(updateMenuPosition);
         if (menuElement) {
            removeKeyboardNavigation = setupKeyboardNavigation(menuElement);
            console.log(
               "renderedMainMenu",
               contextMenuController.renderedMainMenu,
            );
            console.log(
               "renderedSubMenu",
               contextMenuController.renderedSubMenu,
            );
         }
      }
   } else if (removeKeyboardNavigation) {
      removeKeyboardNavigation();
   }
});
</script>

{#if isOpen && menuItems && originalPosition}
   <div
      class="absolute z-100"
      style={positionStyles}
      bind:this={menuElement}
      use:onOutsideOrEsc={() => {
         contextMenuController.closeMenu();
      }}>
      <ul
         class="rounded-field outlined bg-base-200 flex min-w-48 flex-col p-1 shadow-xl">
         {#if activeSubMenu === undefined}
            {#each menuItems as menuItem}
               {#if menuItem.type === "separator"}
                  <SeparatorMenuItem />
               {:else if menuItem.type === "action"}
                  <ActionMenuItem menuItem={menuItem} inSubMenu={false} />
               {:else if menuItem.type === "group"}
                  <GroupMenuItem
                     menuItem={menuItem}
                     isReturn={false}
                     inSubMenu={false}
                     onclick={() => {
                        contextMenuController.setActiveSubMenu(menuItem);
                     }} />
               {/if}
            {/each}
         {:else}
            <GroupMenuItem
               menuItem={activeSubMenu}
               isReturn={true}
               inSubMenu={true}
               onclick={() => {
                  contextMenuController.unsetActiveSubMenu();
               }} />
            <SeparatorMenuItem />
            {#each activeSubMenu.children as subMenuItem}
               {#if subMenuItem.type === "separator"}
                  <SeparatorMenuItem />
               {:else if subMenuItem.type === "action"}
                  <ActionMenuItem inSubMenu={true} menuItem={subMenuItem} />
               {/if}
            {/each}
         {/if}
      </ul>
   </div>
{/if}
