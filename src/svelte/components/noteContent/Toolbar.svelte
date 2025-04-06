<script lang="ts">
import type {
   ActionMenuItem,
   GroupMenuItem,
} from "@projectTypes/editorMenuTypes";

import Button from "@components/utils/Button.svelte";

import { screenSizeController } from "@controllers/screenSizeController.svelte";
import { settingsController } from "@controllers/settingsController.svelte";
import { getEditorToolbarMenuItems } from "@utils/editorMenuItems";

let { editorBox } = $props();
let showToolbar = $derived(
   screenSizeController.isMobile || settingsController.state.showEditorToolbar,
);
let toolbarItems = $derived(getEditorToolbarMenuItems(editorBox));
</script>

{#if editorBox}
   ToolbarBold = {editorBox.current.isActive("bold")}
{/if}

<!-- {#if showToolbar && editorBox}
   <ul>
      <li>
         <button class={editorBox.current.isActive("bold") ? "highlight" : ""}
            >Bold</button>
         <Button
            size="small"
            class={editorBox.current.isActive("bold") ? "highlight" : ""}
            onclick={() => {
               editorBox.current.chain().focus().toggleBold().run();
            }}
            tooltip="Bold">
            {editorBox.current.isActive("bold")}
            <BoldIcon size="1.25rem" />
         </Button>
      </li>
   </ul>
{/if} -->

{#snippet actionMenuItem(menuItem: ActionMenuItem)}
   <li>
      <Button
         size="small"
         class="{menuItem.class} {menuItem.checked ? 'highlight' : ''}"
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
            {@render separatorMenuItem()}
         {:else if childItem.type === "action"}
            {@render actionMenuItem(childItem)}
         {/if}
      {/each}
   </li>
{/snippet}
{#snippet separatorMenuItem()}
   <li class="text-base-content/50">|</li>
{/snippet}

{#if showToolbar && toolbarItems}
   {console.log("re-rendering toolbar")}
   <ul
      class="bg-base-100 flex w-full flex-row flex-nowrap items-center gap-2 py-2">
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
