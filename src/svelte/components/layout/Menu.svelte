<!-- Menu.svelte -->
<script>
import { tick, onDestroy } from "svelte";
import { closeOnOutsideOrEsc } from "../../../directives/closeOnOutsideOrEsc";
import Button from "../utils/Button.svelte";
import Check from "lucide-svelte/icons/check"; // Para los iconos

let { menuController } = $props();

let menuElement = $state(null);
let isRendered = $state(false);
let activeIndex = $state(-1);

// Función para manejar la interacción con submenús
function handleMouseEnter(index) {
  const item = menuController.menuItems[index];
  if (item.children) {
    menuController.openSubMenu(menuElement, item.children); // Abre el submenú
  }
}

function handleKeyDown(event) {
  if (!menuController.isOpen) return;

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
        const activeItems = menuController.menuItems.filter(
          (item) => !item.separator,
        );
        if (activeIndex < activeItems.length) {
          const item = activeItems[activeIndex];
          if (item.onClick) item.onClick();
          menuController.close(); // Cierra el menú después de la selección
        }
      }
      break;
  }
}

// Configurar los listeners de teclado
$effect(() => {
  if (menuController.isOpen) {
    window.addEventListener("keydown", handleKeyDown);
  } else {
    window.removeEventListener("keydown", handleKeyDown);
  }
});

onDestroy(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

$effect(async () => {
  if (menuController.isOpen) {
    activeIndex = -1; // Resetear la selección activa
    isRendered = false;
    await tick();
    if (menuElement) {
      const width = menuElement.offsetWidth;
      const height = menuElement.offsetHeight;
      if (width > 0 && height > 0) {
        menuController.setMenuDimensions(width, height);
        await tick();
        isRendered = true;
      }
    }
  } else {
    isRendered = false;
  }
});

let adaptedPosition = $derived(menuController.getAdaptedPosition());
</script>

{#if menuController.isOpen}
  <ul
    bind:this={menuElement}
    id="menu"
    role="menu"
    aria-orientation="vertical"
    tabindex="-1"
    use:closeOnOutsideOrEsc={() => menuController.close()}
    class="rounded-box bordered bg-base-200 absolute z-20 min-w-[160px] p-1 shadow-lg"
    style="left: {adaptedPosition.x}px; top: {adaptedPosition.y}px; visibility: {isRendered
      ? 'visible'
      : 'hidden'}; opacity: {isRendered
      ? '1'
      : '0'}; transition: opacity 0.1s ease-in-out;">
    {#each menuController.menuItems as item, i}
      {#if item.separator}
        <li class="border-border-normal my-1 border-t-2" role="separator"></li>
      {:else}
        <li onmouseenter={() => handleMouseEnter(i)}>
          <Button
            onclick={() => {
              if (item.onClick) item.onClick();
              menuController.close();
            }}
            role="menuitem"
            aria-checked={item.checked !== undefined
              ? item.checked
                ? "true"
                : "false"
              : undefined}
            tabindex={i === activeIndex ? "0" : "-1"}
            cssClass="w-full flex items-center justify-between {item.class ||
              ''} {activeIndex === i
              ? 'bg-primary/10'
              : ''} focus:outline-none">
            <div class="flex items-center">
              {#if item.icon}
                <span class="mr-2">
                  <item.icon size="18" />
                </span>
              {/if}
              <span>{item.label}</span>
            </div>
            {#if item.checked !== undefined}
              <div class="ml-2 flex w-5 justify-center">
                {#if item.checked}
                  <Check size="16" />
                {/if}
              </div>
            {/if}
          </Button>
        </li>
      {/if}
    {/each}
  </ul>
{/if}
