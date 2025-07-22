<script lang="ts">
import type { RenderItem } from "@projectTypes/ui/contextMenuTypes";

import type { ActionMenuItem } from "@projectTypes/ui/contextMenuTypes";

import { CheckIcon } from "lucide-svelte";

import { floatingMenuController } from "@controllers/menu/FloatingMenuController.svelte";
import Button from "@components/utils/Button.svelte";
import { onMount } from "svelte";

let {
   menuItem,
   inSubMenu,
}: {
   menuItem: ActionMenuItem;
   inSubMenu: boolean;
} = $props();

let renderId = crypto.randomUUID();
let itemElement: HTMLElement | undefined = $state(undefined);

onMount(() => {
   // añadir al array del controlador que se usara en la navegación por teclado
   if (itemElement) {
      const renderMenuItem: RenderItem = {
         renderId: renderId,
         menuItem: menuItem,
         htmlElement: itemElement,
      };
      if (!inSubMenu) {
         floatingMenuController.renderedMainMenu.push(renderMenuItem);
      } else {
         floatingMenuController.renderedSubMenu.push(renderMenuItem);
      }
   } else {
      console.warn("elemento html no encontrado");
   }
});
</script>

<li>
   <Button
      bind:buttonElement={itemElement}
      disabled={menuItem.disabled ? true : false}
      size="small"
      class="w-full justify-between outline-none {menuItem.class}"
      onclick={() => {
         menuItem.action?.();
         floatingMenuController.closeMenu();
      }}>
      <span class="flex items-center gap-2">
         <menuItem.icon size="1.0625rem" />
         {menuItem.label}
      </span>
      {#if menuItem.checked}
         <span class="text-faint-content">
            <CheckIcon size="1.0625rem" />
         </span>
      {/if}
   </Button>
</li>
