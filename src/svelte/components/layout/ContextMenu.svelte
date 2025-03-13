<script>
import Button from "../utils/Button.svelte";
import { contextMenuController } from "../../controllers/contextMenuController.svelte";
import { closeOnOutsideOrEsc } from "../../../directives/closeOnOutsideOrEsc";

let menuElement = $state(null);
let isRendered = $state(false); // visibilidad del menú para prevenir flash de overflow

$effect(() => {
  // Este efecto se ejecuta cuando cambia el estado de apertura del menú
  if (contextMenuController.isOpen) {
    isRendered = false;

    // Usar RAF para asegurar que el menú sea inicialmente invisible
    requestAnimationFrame(() => {
      if (menuElement) {
        // Medir el menú mientras está invisible
        const width = menuElement.offsetWidth;
        const height = menuElement.offsetHeight;

        if (width > 0 && height > 0) {
          contextMenuController.setMenuDimensions(width, height);

          // Hacer visible el menú después de que se hayan calculado las dimensiones
          requestAnimationFrame(() => {
            isRendered = true;
          });
        }
      }
    });
  } else {
    isRendered = false;
  }
});

// Posición adaptada derivada
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
              if (item.onClick) {
                item.onClick();
              }
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
