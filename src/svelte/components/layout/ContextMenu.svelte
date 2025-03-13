<script>
import Button from "../utils/Button.svelte";
import { contextMenuController } from "../../controllers/contextMenuController.svelte";
import { closeOnOutsideOrEsc } from "../../../directives/closeOnOutsideOrEsc";

let menuElement = $state(null);

$effect(() => {
  if (contextMenuController.isOpen) {
    contextMenuController.setMenuDimensions(
      menuElement.offsetWidth,
      menuElement.offsetHeight,
    );
  }
});

let position = $derived(contextMenuController.getAdaptedPosition());
</script>

{#if contextMenuController.isOpen}
  <ul
    bind:this={menuElement}
    id="context-menu"
    role="menu"
    aria-orientation="vertical"
    tabindex="-1"
    use:closeOnOutsideOrEsc={() => {
      contextMenuController.close();
    }}
    class="rounded-box bordered bg-base-200 absolute z-20 mt-1 p-2 shadow"
    style="left: {position.x}px; top: {position.y}px;">
    {#each contextMenuController.menuItems as item, i}
      {#if item.separator}
        <li class="border-border-normal my-1 border-t-2" role="separator"></li>
      {:else}
        <li>
          <Button
            onclick={() => {
              if (item.onClick) {
                item.onClick();
              }
              contextMenuController.close();
            }}
            role="menuitem"
            tabindex="0"
            cssClass="w-full {item.class || ''}">
            {#if item.icon}
              <item.icon size="18"></item.icon>
            {/if}
            {item.label}
          </Button>
        </li>
      {/if}
    {/each}
  </ul>
{/if}
