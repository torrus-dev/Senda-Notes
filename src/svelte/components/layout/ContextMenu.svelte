<script>
import Button from "../utils/Button.svelte";
import { contextMenuController } from "../../controllers/contextMenuController.svelte";
import { closeOnOutsideOrEsc } from "../../../directives/closeOnOutsideOrEsc";
import { tick } from "svelte";

let menuElement = $state(null);
let isRendered = $state(false); // Control de visibilidad para evitar flash de overflow

$effect(async () => {
  if (contextMenuController.isOpen) {
    isRendered = false;
    await tick(); // Espera a que se actualice el DOM
    if (menuElement) {
      // Medir dimensiones del menú ya renderizado (aunque invisible)
      const width = menuElement.offsetWidth;
      const height = menuElement.offsetHeight;
      if (width > 0 && height > 0) {
        contextMenuController.setMenuDimensions(width, height);
        await tick(); // Espera a que se apliquen los cambios
        isRendered = true;
      }
    }
  } else {
    isRendered = false;
  }
});

// Posición adaptada derivada de los datos del controlador
let adaptedPosition = $derived(contextMenuController.getAdaptedPosition());
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
    class="rounded-box bordered bg-base-200 absolute z-20 min-w-[160px] p-2 shadow-lg"
    style="
      left: {adaptedPosition.x}px; 
      top: {adaptedPosition.y}px; 
      visibility: {isRendered ? 'visible' : 'hidden'};
      opacity: {isRendered ? '1' : '0'};
      transition: opacity 0.1s ease-in-out;
    ">
    {#each contextMenuController.menuItems as item, i}
      {#if item.separator}
        <li class="border-border-normal my-1 border-t-2" role="separator"></li>
      {:else}
        <li>
          <Button
            onclick={() => {
              if (item.onClick) item.onClick();
              contextMenuController.close();
            }}
            role="menuitem"
            tabindex="0"
            cssClass="w-full {item.class || ''}">
            {#if item.icon}
              <item.icon size="18" />
            {/if}
            {item.label}
          </Button>
        </li>
      {/if}
    {/each}
  </ul>
{/if}
