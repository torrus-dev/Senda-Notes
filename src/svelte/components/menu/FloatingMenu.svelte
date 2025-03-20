<script>
import { floatingMenuController } from "../../controllers/floatingMenuController.svelte";
import { tick, onDestroy } from "svelte";
import { closeOnOutsideOrEsc } from "../../../directives/closeOnOutsideOrEsc";
import Button from "../utils/Button.svelte";
import Check from "lucide-svelte/icons/check";
import { initKeyboardNavigation } from "./keyboardNavigation.js";

let menuElement = $state(null);
let isRendered = $state(false);
let activeIndex = $state(-1);

// Control de submenús
function handleMouseEnter(index) {
  const item = floatingMenuController.menuItems[index];
  if (item.children) {
    floatingMenuController.openSubMenu(menuElement, item.children);
  }
}

// Configuración del listener de teclado
let removeKeyDownListener;
$effect(() => {
  if (floatingMenuController.isOpen) {
    removeKeyDownListener = initKeyboardNavigation({
      menuElement,
      contextMenuController: floatingMenuController,
      onActiveChange: (index) => (activeIndex = index),
    });
  } else if (removeKeyDownListener) {
    removeKeyDownListener();
    removeKeyDownListener = null;
  }
});

onDestroy(() => {
  if (removeKeyDownListener) removeKeyDownListener();
});

$effect(async () => {
  if (floatingMenuController.isOpen) {
    activeIndex = -1;
    isRendered = false;
    await tick();
    if (menuElement) {
      const width = menuElement.offsetWidth;
      const height = menuElement.offsetHeight;
      if (width > 0 && height > 0) {
        floatingMenuController.setMenuDimensions(width, height);
        await tick();
        isRendered = true;
      }
    }
  } else {
    isRendered = false;
  }
});

let adaptedPosition = $derived(floatingMenuController.getAdaptedPosition());
</script>

{#if floatingMenuController.isOpen}
  <ul
    bind:this={menuElement}
    id="context-menu"
    role="menu"
    aria-orientation="vertical"
    tabindex="-1"
    use:closeOnOutsideOrEsc={() => floatingMenuController.close()}
    class="rounded-box bordered bg-base-200 absolute z-20 min-w-[160px] p-1 shadow-lg"
    style="left: {adaptedPosition.x}px; top: {adaptedPosition.y}px; visibility: {isRendered
      ? 'visible'
      : 'hidden'}; opacity: {isRendered
      ? '1'
      : '0'}; transition: opacity 0.1s ease-in-out;">
    {#each floatingMenuController.menuItems as item, i}
      {#if item.separator}
        <li class="border-border-normal my-1 border-t-2" role="separator"></li>
      {:else}
        <li onmouseenter={() => handleMouseEnter(i)}>
          <Button
            onclick={() => {
              if (item.onClick) item.onClick();
              floatingMenuController.close();
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
  <!-- Sub menu: Esta es solo la idea que tengo -->
  <!-- {#if floatingMenuController.subMenu.isOpen}
    <ul...>
  {/if} -->
{/if}
