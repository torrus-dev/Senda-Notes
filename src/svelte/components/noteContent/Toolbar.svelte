<script lang="ts">
import Button from "@components/utils/Button.svelte";

import { screenSizeController } from "@controllers/screenSizeController.svelte";
import { settingsController } from "@controllers/settingsController.svelte";
import { workspace } from "@controllers/workspaceController.svelte";
import { getEditorToolbarMenuItems } from "@utils/editorMenuItems";
import type {
   ActionMenuItem,
   GroupMenuItem,
   SeparatorMenuItem,
   MenuItem,
} from "@projectTypes/editorMenuTypes";
import ToolbarActionMenuItem from "./ToolbarActionMenuItem.svelte";

let { editorInstance } = $props();
let toolbarItems: MenuItem[] = $state([]);
let showToolbar = $derived(
   screenSizeController.isMobile || settingsController.state.showEditorToolbar,
);

// Actualizar los items de la barra de herramientas cuando el editorInstance cambia
$effect(() => {
   if (!editorInstance) {
      toolbarItems = [];
      return;
   }

   // Actualizar inicialmente los items
   toolbarItems = getEditorToolbarMenuItems(editorInstance);

   // Escuchar eventos de selección y actualizar los items
   const updateToolbarItems = () => {
      toolbarItems = getEditorToolbarMenuItems(editorInstance);
   };

   // Registrar los eventos para actualizar los items cuando cambia la selección
   editorInstance.on("selectionUpdate", updateToolbarItems);
   editorInstance.on("focus", updateToolbarItems);

   return () => {
      // Limpiar los event listeners cuando cambia el editor
      if (editorInstance) {
         editorInstance.off("selectionUpdate", updateToolbarItems);
         editorInstance.off("focus", updateToolbarItems);
      }
   };
});
</script>

{#snippet groupMenuItem(menuItem: GroupMenuItem)}
   <li>
      {#each menuItem.children as childItem}
         {#if childItem.type === "separator"}
            {@render separatorMenuItem(childItem)}
         {:else if childItem.type === "action"}
            <ToolbarActionMenuItem menuItem={childItem} />
         {/if}
      {/each}
   </li>
{/snippet}
{#snippet separatorMenuItem(menuItem: SeparatorMenuItem)}
   <li class="text-base-content/50">|</li>
{/snippet}

{#if showToolbar}
   {#if toolbarItems}
      <ul
         class="bg-base-100 flex w-full flex-row flex-nowrap items-center gap-2 py-2">
         {#each toolbarItems as toolbarItem}
            {#if toolbarItem.type === "separator"}
               {@render separatorMenuItem(toolbarItem)}
            {:else if toolbarItem.type === "action"}
               <ToolbarActionMenuItem menuItem={toolbarItem} />
            {:else if toolbarItem.type === "group"}
               {@render groupMenuItem(toolbarItem)}
            {/if}
         {/each}
      </ul>
   {/if}
{/if}
