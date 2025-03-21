<script>
import { floatingMenuController } from "../../controllers/floatingMenuController.svelte";
import { tick, onDestroy } from "svelte";
import { closeOnOutsideOrEsc } from "../../../directives/closeOnOutsideOrEsc";
import BaseMenu from "./BaseMenu.svelte";
import { initKeyboardNavigation } from "./keyboardNavigation.js";

// Estados para el menú principal
let menuElement = $state(null);
let isRendered = $state(false);
let activeIndex = $state(-1);

// Estados para el submenú
let submenuElement = $state(null);
let isSubmenuRendered = $state(false);
let activeSubmenuIndex = $state(-1);

// Control de debounce para hover
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
  if (hasChildren(item)) {
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

// Para determinar si un ítem tiene submenú
function hasChildren(item) {
  return "children" in item && item.children && item.children.length > 0;
}

// Manejador unificado para clicks en elementos del menú
function handleItemClick(item, event) {
  // Si el evento viene del submenú, prevenir propagación
  if (
    floatingMenuController.subMenu.isOpen &&
    floatingMenuController.subMenu.items.includes(item)
  ) {
    event.stopPropagation();
  }

  if ("onClick" in item && item.onClick) {
    item.onClick();
    floatingMenuController.close();
  }
}

function handleSubmenuMouseEnter(index) {
  activeSubmenuIndex = index;
  // Si hay un timeout pendiente, cancelarlo
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
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

// Posiciones adaptadas
let adaptedPosition = $derived(floatingMenuController.getAdaptedPosition());
let adaptedSubmenuPosition = $derived(
  floatingMenuController.getAdaptedPosition(true),
);

// Preparamos los items para el menú principal con datos adicionales
let enhancedMenuItems = $derived(
  floatingMenuController.menuItems.map((item, i) => ({
    ...item,
    expanded:
      floatingMenuController.subMenu.isOpen &&
      floatingMenuController.subMenu.parentItemIndex === i,
  })),
);
</script>

{#if floatingMenuController.isOpen}
  <!-- Contenedor principal que engloba tanto el menú como el submenú -->
  <div
    role="menu"
    tabindex="0"
    use:closeOnOutsideOrEsc={() => floatingMenuController.close()}>
    <!-- Menú principal -->
    <BaseMenu
      bind:menuElement={menuElement}
      items={enhancedMenuItems}
      position={adaptedPosition}
      activeIndex={activeIndex}
      isRendered={isRendered}
      zIndex={20}
      showSubmenuIndicator={true}
      onItemClick={handleItemClick}
      onItemMouseEnter={handleItemMouseEnter}
      cssClass="menu-primary" />

    <!-- Submenú -->
    {#if floatingMenuController.subMenu.isOpen}
      <BaseMenu
        bind:menuElement={submenuElement}
        items={floatingMenuController.subMenu.items}
        position={adaptedSubmenuPosition}
        activeIndex={activeSubmenuIndex}
        isRendered={isSubmenuRendered}
        zIndex={30}
        showSubmenuIndicator={false}
        onItemClick={handleItemClick}
        onItemMouseEnter={handleSubmenuMouseEnter}
        cssClass="menu-secondary" />
    {/if}
  </div>
{/if}
