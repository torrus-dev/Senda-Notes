<script lang="ts">
import type { DropdownMenuData } from "@projectTypes/floatingMenuTypes";

import { contextMenuController } from "@controllers/floatingMenuController.svelte";
import { computePosition, offset, flip, shift } from "@floating-ui/dom";
import Button from "@components/utils/Button.svelte";
import { closeOnOutsideOrEsc } from "@directives/closeOnOutsideOrEsc";

import { tick } from "svelte";

let { isOpen, menuItems, triggerElement }: DropdownMenuData = $derived(
   contextMenuController.getMenuState(),
);
let menuElement = $state<HTMLElement | null>(null);
let positionStyles = $state("left:0; top:0;");

</script>

{#if isOpen && menuItems && triggerElement}
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
