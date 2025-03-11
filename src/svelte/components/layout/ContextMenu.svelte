<script>
import Button from "../utils/Button.svelte";
import { contextMenuController } from "../../controllers/contextMenuController.svelte";
import { closeOnOutsideOrEsc } from "../../../directives/closeOnOutsideOrEsc";

let menuElement = $state(null);

// Efecto para manejar el foco cuando el menú se abre
$effect(() => {
  if (contextMenuController.isOpen && menuElement) {
    // Cuando se abre el menú, enfocar el primer elemento
    setTimeout(() => {
      const firstItem = menuElement.querySelector('[role="menuitem"]');
      if (firstItem) {
        firstItem.focus();
      }
    }, 0);
  }
});

// Maneja el clic en un elemento del menú
function handleItemClick(item) {
  if (item.onClick) {
    item.onClick();
  }
  contextMenuController.close();
}

let positionX = $derived(contextMenuController.getPositionX());
let positionY = $derived(contextMenuController.getPositionY());
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
    style="left: {positionX}px; top: {positionY}px;">
    {#each contextMenuController.items as item, i}
      {#if item.separator}
        <li class="border-border-normal my-1 border-t-2" role="separator"></li>
      {:else}
        <li>
          <Button
            onclick={() => handleItemClick(item)}
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
