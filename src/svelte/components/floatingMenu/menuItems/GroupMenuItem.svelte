<script lang="ts">
import Button from "@components/utils/Button.svelte";
import { contextMenuController } from "@controllers/floatingMenuController.svelte";
import type {
   GroupMenuItem,
   RenderItem,
} from "@projectTypes/floatingMenuTypes";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-svelte";
import { onMount } from "svelte";

let {
   menuItem,
   isReturn: arrowLeft = false,
   inSubMenu,
   onclick,
}: {
   menuItem: GroupMenuItem;
   isReturn: boolean;
   inSubMenu: boolean;
   onclick: () => void;
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
      cssClass="w-full {menuItem.class}"
      onclick={onclick}>
      {#if arrowLeft}
         <ChevronLeftIcon size="1.0625rem" class="absolute left-2" />
      {/if}
      <span
         class="flex flex-1 items-center gap-2 {arrowLeft
            ? 'justify-center'
            : ''}">
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
