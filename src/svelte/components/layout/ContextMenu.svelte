<script>
import Button from "../utils/Button.svelte";
import { contextMenuController } from "../../controllers/contextMenuController.svelte";
import { closeOnOutsideOrEsc } from "../../../directives/closeOnOutsideOrEsc";
import { tick, onDestroy } from "svelte";

let menuElement = $state(null);
let isRendered = $state(false);
let activeIndex = $state(-1);

// Función para manejar la navegación con teclado
function handleKeyDown(event) {
  // Solo procesar eventos de teclado cuando el menú está abierto
  if (!contextMenuController.isOpen) return;

  const itemElements = Array.from(
    menuElement?.querySelectorAll("li button") || [],
  );

  if (itemElements.length === 0) return;

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      activeIndex = (activeIndex + 1) % itemElements.length;
      itemElements[activeIndex]?.focus();
      break;
    case "ArrowUp":
      event.preventDefault();
      activeIndex =
        (activeIndex - 1 + itemElements.length) % itemElements.length;
      itemElements[activeIndex]?.focus();
      break;
    case "Enter":
      if (activeIndex >= 0) {
        const activeItems = contextMenuController.menuItems.filter(
          (item) => !item.separator,
        );
        if (activeIndex < activeItems.length) {
          const item = activeItems[activeIndex];
          if (item.onClick) item.onClick();
          contextMenuController.close();
        }
      }
      break;
  }
}

// Configurar el event listener global
$effect(() => {
  if (contextMenuController.isOpen) {
    // Añadir listener global cuando el menú se abre
    window.addEventListener("keydown", handleKeyDown);
  } else {
    // Remover listener cuando el menú se cierra
    window.removeEventListener("keydown", handleKeyDown);
  }
});

// Asegurarse de que el listener se elimine cuando el componente se desmonta
onDestroy(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

$effect(async () => {
  if (contextMenuController.isOpen) {
    activeIndex = -1; // Resetear la selección activa
    isRendered = false;
    await tick();
    if (menuElement) {
      const width = menuElement.offsetWidth;
      const height = menuElement.offsetHeight;
      if (width > 0 && height > 0) {
        contextMenuController.setMenuDimensions(width, height);
        await tick();
        isRendered = true;

        // Ya no necesitamos enfocar el menú o la primera opción automáticamente
        // El listener global se encargará de la navegación
      }
    }
  } else {
    isRendered = false;
  }
});

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
    class="rounded-box bordered bg-base-200 absolute z-20 min-w-[160px] p-1 shadow-lg"
    style=" left: {adaptedPosition.x}px; top: {adaptedPosition.y}px; visibility: {isRendered
      ? 'visible'
      : 'hidden'}; opacity: {isRendered ? '1' : '0'}; transition: opacity 0.1s
    ease-in-out; ">
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
            tabindex={i === activeIndex ? "0" : "-1"}
            cssClass="w-full {item.class || ''} {activeIndex === i
              ? 'bg-primary/10'
              : ''} focus:outline-none">
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
