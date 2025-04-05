<script lang="ts">
import Button from "@components/utils/Button.svelte";

import { screenSizeController } from "@controllers/screenSizeController.svelte";
import { settingsController } from "@controllers/settingsController.svelte";
import { workspace } from "@controllers/workspaceController.svelte";
import {
   getEditorToolbarMenuItems,
   getEditorContextMenuItems,
} from "@utils/editorMenuItems";
import type {
   ActionMenuItem,
   GroupMenuItem,
   SeparatorMenuItem,
   MenuItem,
} from "@projectTypes/editorMenuTypes";

let toolbarItems: MenuItem[] | null = $derived(
   getEditorToolbarMenuItems(workspace.getEditorInstance()),
);
// let toolbarItems: MenuItem[] | null = $derived.by(() => {
//    if (editorInstance) {
//       return getEditorToolbarMenuItems(editorInstance);
//    } else {
//       return null;
//    }
// });
let showToolbar = $derived(
   screenSizeController.isMobile || settingsController.state.showEditorToolbar,
);
</script>

{#snippet actionMenuItem(menuItem: ActionMenuItem)}
   <li>
      <Button
         size="small"
         cssClass="{menuItem.class} {menuItem.checked ? 'highlight' : ''}"
         onclick={() => {
            menuItem.action?.();
         }}
         tooltip={menuItem.label}>
         <menuItem.icon size="1.25rem" />
      </Button>
   </li>
{/snippet}
{#snippet groupMenuItem(menuItem: GroupMenuItem)}
   <li>
      {#each menuItem.children as childItem}
         {#if childItem.type === "separator"}
            {@render separatorMenuItem(childItem)}
         {:else if childItem.type === "action"}
            {@render actionMenuItem(childItem)}
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
               {@render actionMenuItem(toolbarItem)}
            {:else if toolbarItem.type === "group"}
               {@render groupMenuItem(toolbarItem)}
            {/if}
         {/each}
      </ul>
   {/if}
{/if}
