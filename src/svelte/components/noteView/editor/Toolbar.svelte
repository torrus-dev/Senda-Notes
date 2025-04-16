<script lang="ts">
import type {
   ActionMenuItem,
   GroupMenuItem,
} from "@projectTypes/editorMenuTypes";
import type { Editor } from "@tiptap/core";

import Button from "@components/utils/Button.svelte";
import { screenSizeController } from "@controllers/screenSizeController.svelte";
import { settingsController } from "@controllers/settingsController.svelte";
import { getEditorToolbarMenuItems } from "@utils/editorMenuItems";

let { editorBox }: { editorBox: { current: Editor } } = $props();
let showToolbar = $derived(
   screenSizeController.isMobile || settingsController.state.showEditorToolbar,
);
let toolbarItems = $derived(getEditorToolbarMenuItems(editorBox));
</script>

{#snippet actionMenuItem(menuItem: ActionMenuItem)}
   <li>
      <Button
         size="small"
         class="{menuItem.class} {menuItem.checked ? 'highlight' : ''}"
         onclick={() => {
            menuItem.action?.();
         }}
         title={menuItem.label}>
         <menuItem.icon size="1.25rem" />
      </Button>
   </li>
{/snippet}
{#snippet groupMenuItem(menuItem: GroupMenuItem)}
   <li>
      {#each menuItem.children as childItem}
         {#if childItem.type === "separator"}
            {@render separatorMenuItem()}
         {:else if childItem.type === "action"}
            {@render actionMenuItem(childItem)}
         {/if}
      {/each}
   </li>
{/snippet}
{#snippet separatorMenuItem()}
   <li class="text-faint-content">|</li>
{/snippet}

{#if showToolbar && toolbarItems}
   <ul class="flex w-full flex-row flex-nowrap items-center gap-2 py-2">
      {#each toolbarItems as toolbarItem}
         {#if toolbarItem.type === "separator"}
            {@render separatorMenuItem()}
         {:else if toolbarItem.type === "action"}
            {@render actionMenuItem(toolbarItem)}
         {:else if toolbarItem.type === "group"}
            {@render groupMenuItem(toolbarItem)}
         {/if}
      {/each}
   </ul>
{/if}
