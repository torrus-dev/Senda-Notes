<script>
import Button from "./Button.svelte";
import { closeOnOutsideOrEsc } from "../../../directives/closeOnOutsideOrEsc";

let {
  label,
  labelClass = "",
  menuItems = [],
  position = "start",
  maxMenuWidth = 44,
  closeOnClick = true, // Nueva prop para control opcional
  disabled = false,
} = $props();

let isOpen = $state(false);
let menuElement = $state(null);
let buttonElement = $state();

const closeDropdown = () => {
  isOpen = false;
};
const toggle = () => (isOpen = !isOpen);

// Función para manejar el clic en un ítem del menú
const handleItemClick = (item) => {
  if (closeOnClick) {
    // Primero ejecutamos el callback del ítem
    item.onClick();
    // Luego cerramos el menú
    closeDropdown();
  } else {
    item.onClick();
  }
};

const positionClass =
  position === "start"
    ? "left-0"
    : position === "center"
      ? "dropdown-center"
      : position === "end"
        ? "right-0"
        : "";
</script>

<div class="relative" use:closeOnOutsideOrEsc={closeDropdown}>
  <Button
    onclick={toggle}
    cssClass={labelClass}
    aria-haspopup="true"
    aria-expanded={isOpen}
    shape="square"
    bind:buttonElement={buttonElement}>
    {@render label()}
  </Button>

  {#if isOpen && !disabled}
    <ul
      class="rounded-box bordered absolute z-20 mt-1 bg-(--color-base-200) p-2 shadow-lg {positionClass}"
      style="max-width: {maxMenuWidth}rem;"
      role="menu"
      use:closeOnOutsideOrEsc={closeDropdown}
      bind:this={menuElement}
      tabindex="-1">
      {#each menuItems as item}
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
      {/each}
    </ul>
  {/if}
</div>
