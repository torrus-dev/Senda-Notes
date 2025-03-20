<script>
import { floatingMenuController } from "../../controllers/floatingMenuController.svelte";
import { tick, onDestroy } from "svelte";
import { closeOnOutsideOrEsc } from "../../../directives/closeOnOutsideOrEsc";
import Button from "../utils/Button.svelte";
import Check from "lucide-svelte/icons/check";
import ChevronRight from "lucide-svelte/icons/chevron-right";
import { initKeyboardNavigation } from "./keyboardNavigation.js";

let menuElement = $state(null);
let submenuElement = $state(null);
let isRendered = $state(false);
let isSubmenuRendered = $state(false);
let activeIndex = $state(-1);
let activeSubmenuIndex = $state(-1);
let hoverTimeout = $state(null);

// Control de submenús - debounce para evitar parpadeos
function handleItemMouseEnter(index) {
  // Limpiamos cualquier timeout previo
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
  }

  // Cerramos el submenú si está abierto y estamos sobre un elemento diferente
  if (
    floatingMenuController.subMenu.isOpen &&
    floatingMenuController.subMenu.parentItemIndex !== index
  ) {
    floatingMenuController.closeSubMenu();
  }

  const item = floatingMenuController.menuItems[index];
  if ("children" in item && item.children && item.children.length > 0) {
    // Pequeño delay para evitar cambios rápidos cuando el usuario mueve el mouse
    hoverTimeout = setTimeout(() => {
      // Abrir el submenú solo si el elemento tiene hijos
      if (menuElement) {
        const itemElement = menuElement.children[index];
        floatingMenuController.openSubMenu(itemElement, index);
        activeSubmenuIndex = -1;
      }
    }, 50);
  } else if (floatingMenuController.subMenu.isOpen) {
    // Si no tiene hijos y hay un submenú abierto, cerrar el submenú después de un delay
    // para evitar que se cierre si el usuario está moviendo el ratón hacia el submenú
    hoverTimeout = setTimeout(() => {
      if (!isMouseOverSubmenu()) {
        floatingMenuController.closeSubMenu();
      }
    }, 100);
  }
}

// Helper para revisar si el ratón está sobre el submenú
function isMouseOverSubmenu() {
  if (!submenuElement) return false;

  const submenuRect = submenuElement.getBoundingClientRect();
  const mouse = { x: 0, y: 0 };

  // Obtener la posición actual del ratón
  if (window.event instanceof MouseEvent) {
    mouse.x = window.event.clientX;
    mouse.y = window.event.clientY;
  }

  return (
    mouse.x >= submenuRect.left &&
    mouse.x <= submenuRect.right &&
    mouse.y >= submenuRect.top &&
    mouse.y <= submenuRect.bottom
  );
}

function handleSubmenuMouseEnter(index) {
  activeSubmenuIndex = index;
  // Si hay un timeout pendiente, cancelarlo
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }
}

// Manejar el click en un elemento del menú principal
function handleMenuItemClick(item) {
  if ("onClick" in item && item.onClick) {
    item.onClick();
    floatingMenuController.close(); // Cerrar el menú completo
  }
}

// Evitar que se cierre el submenú cuando el ratón está sobre él
function handleSubmenuMouseLeave() {
  // No hacemos nada por ahora - el evento se manejará desde el elemento padre
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
  if (hoverTimeout) clearTimeout(hoverTimeout);
});

// Efecto para gestionar el menú principal
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

// Efecto para gestionar el submenú
$effect(async () => {
  if (floatingMenuController.subMenu.isOpen) {
    activeSubmenuIndex = -1;
    isSubmenuRendered = false;
    await tick();
    if (submenuElement) {
      const width = submenuElement.offsetWidth;
      const height = submenuElement.offsetHeight;
      if (width > 0 && height > 0) {
        floatingMenuController.setSubMenuDimensions(width, height);
        await tick();
        isSubmenuRendered = true;
      }
    }
  } else {
    isSubmenuRendered = false;
  }
});

// Posición adaptada del menú principal
let adaptedPosition = $derived(floatingMenuController.getAdaptedPosition());

// Posición adaptada del submenú
let adaptedSubmenuPosition = $derived(
  floatingMenuController.getAdaptedPosition(true),
);

// Para determinar si un ítem tiene submenú
function hasChildren(item) {
  return "children" in item && item.children && item.children.length > 0;
}
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
      {#if "separator" in item && item.separator}
        <li class="border-border-normal my-1 border-t-2" role="separator"></li>
      {:else}
        <li
          class="relative"
          onmouseenter={() => handleItemMouseEnter(i)}
          class:has-submenu={hasChildren(item)}>
          <Button
            onclick={() => handleMenuItemClick(item)}
            role="menuitem"
            aria-haspopup={hasChildren(item) ? "true" : undefined}
            aria-expanded={hasChildren(item) &&
            floatingMenuController.subMenu.isOpen &&
            floatingMenuController.subMenu.parentItemIndex === i
              ? "true"
              : "false"}
            aria-checked={"checked" in item && item.checked !== undefined
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
              {#if "icon" in item && item.icon}
                <span class="mr-2">
                  <item.icon size="18" />
                </span>
              {/if}
              <span>{item.label}</span>
            </div>
            <div class="ml-2 flex w-5 justify-center">
              {#if "checked" in item && item.checked !== undefined}
                {#if item.checked}
                  <Check size="16" />
                {/if}
              {:else if hasChildren(item)}
                <ChevronRight size="16" />
              {/if}
            </div>
          </Button>
        </li>
      {/if}
    {/each}
  </ul>

  <!-- Submenú -->
  {#if floatingMenuController.subMenu.isOpen}
    <ul
      bind:this={submenuElement}
      id="submenu"
      role="menu"
      aria-orientation="vertical"
      tabindex="-1"
      class="rounded-box bordered bg-base-200 absolute z-30 min-w-[160px] p-1 shadow-lg"
      style="left: {adaptedSubmenuPosition.x}px; top: {adaptedSubmenuPosition.y}px; visibility: {isSubmenuRendered
        ? 'visible'
        : 'hidden'}; opacity: {isSubmenuRendered
        ? '1'
        : '0'}; transition: opacity 0.1s ease-in-out;"
      onmouseleave={handleSubmenuMouseLeave}>
      {#each floatingMenuController.subMenu.items as subItem, i}
        {#if "separator" in subItem && subItem.separator}
          <li class="border-border-normal my-1 border-t-2" role="separator">
          </li>
        {:else}
          <li onmouseenter={() => handleSubmenuMouseEnter(i)}>
            <Button
              onclick={() => handleMenuItemClick(subItem)}
              role="menuitem"
              aria-checked={"checked" in subItem &&
              subItem.checked !== undefined
                ? subItem.checked
                  ? "true"
                  : "false"
                : undefined}
              tabindex={i === activeSubmenuIndex ? "0" : "-1"}
              cssClass="w-full flex items-center justify-between {subItem.class ||
                ''} {activeSubmenuIndex === i
                ? 'bg-primary/10'
                : ''} focus:outline-none">
              <div class="flex items-center">
                {#if "icon" in subItem && subItem.icon}
                  <span class="mr-2">
                    <subItem.icon size="18" />
                  </span>
                {/if}
                <span>{subItem.label}</span>
              </div>
              {#if "checked" in subItem && subItem.checked !== undefined}
                <div class="ml-2 flex w-5 justify-center">
                  {#if subItem.checked}
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
{/if}
