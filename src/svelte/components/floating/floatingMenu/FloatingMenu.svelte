<script lang="ts">
import type {
   ContextMenuData,
   DropdownMenuData,
   FloatingMenuData,
} from "@projectTypes/ui/contextMenuTypes";

import { floatingMenuController } from "@controllers/menu/floatingMenuController.svelte";
import { setupKeyboardNavigation } from "@components/floating/floatingMenu/keyboardNavigation";

import {
   createCoordinateReference,
   calculateFloatingPosition,
} from "@utils/floatingPositionUtils";

import { tick } from "svelte";
import ActionMenuItem from "@components/floating/floatingMenu//menuItems/ActionMenuItem.svelte";
import GroupMenuItem from "@components/floating/floatingMenu//menuItems/GroupMenuItem.svelte";
import SeparatorMenuItem from "@components/floating/floatingMenu//menuItems/SeparatorMenuItem.svelte";
import { onPressEsc } from "@directives/onPressEsc";
import { onClickOutside } from "@directives/onClickOutside";

let menuData: FloatingMenuData = $derived(
   floatingMenuController.getMenuState(),
);
let { isOpen, menuItems, activeSubMenu, type } = $derived(menuData);
let menuElement = $state<HTMLElement | null>(null);
let positionStyles = $state("left:0; top:0;");

async function updateMenuPosition() {
   if (!menuElement) return;

   let reference: HTMLElement | ReturnType<typeof createCoordinateReference>;
   let placementOptions: any = {
      placement: "bottom-start",
      offsetValue: 0,
      padding: 5,
      fallbackPlacements: ["top-start"],
   };

   // Dependiendo del tipo de menú, usamos una referencia diferente
   if (type === "context") {
      const contextData = menuData as ContextMenuData;
      if (!contextData.originalPosition) return;

      // Para context menu, usamos las coordenadas del clic
      reference = createCoordinateReference(
         contextData.originalPosition.x,
         contextData.originalPosition.y,
      );
   } else {
      const dropdownData = menuData as DropdownMenuData;
      if (!dropdownData.triggerElement) return;

      // Para dropdown menu, usamos el elemento HTML como referencia
      reference = dropdownData.triggerElement;
      // Configuración específica para dropdown
      placementOptions = {
         placement: "bottom-start",
         offsetValue: 5, // Un poco de espacio entre el trigger y el menú
         padding: 5,
         fallbackPlacements: ["top-start", "bottom-end", "top-end"],
      };
   }

   // Calcular la posición usando la utilidad
   const { x, y } = await calculateFloatingPosition(
      reference,
      menuElement,
      placementOptions,
   );

   positionStyles = `left:${x}px; top:${y}px;`;
}

let removeKeyboardNavigation = $state<any>(undefined);
$effect(() => {
   if (isOpen === true) {
      tick().then(updateMenuPosition);

      if (menuElement) {
         removeKeyboardNavigation = setupKeyboardNavigation(menuElement);
      }

      if (activeSubMenu !== undefined) {
         tick().then(updateMenuPosition);
         if (menuElement) {
            removeKeyboardNavigation = setupKeyboardNavigation(menuElement);
         }
      }
   } else if (removeKeyboardNavigation) {
      removeKeyboardNavigation();
   }
});
</script>

{#if isOpen && menuItems}
   <div
      class="absolute z-100"
      style={positionStyles}
      bind:this={menuElement}
      use:onPressEsc={{
         action: () => {
            floatingMenuController.closeMenu();
         },
      }}
      use:onClickOutside={{
         triggerElement: floatingMenuController.getTriggerElement(),
         action: () => {
            floatingMenuController.closeMenu();
         },
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
                        floatingMenuController.setActiveSubMenu(menuItem);
                     }} />
               {/if}
            {/each}
         {:else}
            <GroupMenuItem
               menuItem={activeSubMenu}
               isReturn={true}
               inSubMenu={true}
               onclick={() => {
                  floatingMenuController.unsetActiveSubMenu();
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
