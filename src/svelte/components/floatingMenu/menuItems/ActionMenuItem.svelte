<script lang="ts">
import type {
   ActionMenuItem,
   RenderItem,
} from "@projectTypes/floatingMenuTypes";

import { CheckIcon } from "lucide-svelte";

import { contextMenuController } from "@controllers/floatingMenuController.svelte";
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
let itemElement: HTMLElement | null = $state(null);

onMount(() => {
   // añadir al array del controlador que se usara en la navegación por teclado
   if (itemElement) {
      const renderMenuItem: RenderItem = {
         renderId: renderId,
         menuItem: menuItem,
         htmlElement: itemElement,
      };
      if (!inSubMenu) {
         contextMenuController.renderedMainMenu.push(renderMenuItem);
      } else {
         contextMenuController.renderedSubMenu.push(renderMenuItem);
      }
   } else {
      console.warn("elemento html no encontrado");
   }
});
</script>

<li>
   <Button
      bind:buttonElement={itemElement}
      size="small"
      cssClass="w-full justify-between outline-none {menuItem.class}"
      onclick={() => {
         menuItem.action?.();
         contextMenuController.closeMenu();
      }}>
      <span class="flex items-center gap-2">
         <menuItem.icon size="1.0625rem" />
         {menuItem.label}
      </span>
      {#if menuItem.checked}
         <span class="text-base-content/50">
            <CheckIcon size="1.0625rem" />
         </span>
      {/if}
   </Button>
</li>
