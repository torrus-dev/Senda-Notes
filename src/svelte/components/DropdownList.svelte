<style>
</style>

<script>
import Button from "./Button.svelte";

let {
  label,
  labelClass = "",
  menuItems = [],
  position = "start",
  maxMenuWidth = 44,
} = $props();

let isOpen = $state(false);
let menuElement = $state(null);
let buttonElement = $state();

const closeDropdown = () => (isOpen = false);
const toggle = () => (isOpen = !isOpen);

const handleKeydown = (e) => {
  if (e.key === "Escape") {
    closeDropdown();
  }
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    toggle();
  }
};
const handleOutsideClick = (e) => {
  if (!menuElement?.contains(e.target) && !buttonElement?.contains(e.target)) {
    closeDropdown();
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

$effect(() => {
  if (!isOpen) return;

  // Usamos setTimeout para asegurarnos de que no se cierre inmediatamente al abrir
  setTimeout(() => {
    document.addEventListener("click", handleOutsideClick);
  }, 0);

  document.addEventListener("keydown", handleKeydown);

  return () => {
    document.removeEventListener("click", handleOutsideClick);
    document.removeEventListener("keydown", handleKeydown);
  };
});
</script>

<div class="relative">
  <Button
    onclick={toggle}
    cssClass={labelClass}
    aria-haspopup="true"
    aria-expanded={isOpen}
    shape="square"
    bind:buttonElement={buttonElement}>
    {@render label()}
  </Button>

  {#if isOpen}
    <ul
      class="rounded-box bordered absolute z-[999] mt-1 bg-(--color-base-200) p-2 shadow {positionClass}"
      style="max-width: {maxMenuWidth}rem;"
      role="menu"
      bind:this={menuElement}
      tabindex="-1">
      {#each menuItems as item}
        <li>
          <Button
            onclick={item.onClick}
            role="menuitem"
            cssClass="w-full {item.class}">
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
