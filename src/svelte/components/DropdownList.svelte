<style>
</style>

<script>
let {
  label,
  labelClass = "",
  menuItems = [],
  position = "start",
  maxMenuWidth = 44,
} = $props();

console.log("menuItems", menuItems);
let { isOpen } = $state(false);
let menuElement;
let buttonElement;

const close = () => (isOpen = false);
const toggle = () => (isOpen = !isOpen);

const handleKeydown = (e) => {
  if (e.key === "Escape") {
    close();
  }
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    toggle();
  }
};

const positionClass =
  position === "start"
    ? "dropdown-start"
    : position === "center"
      ? "dropdown-center"
      : position === "end"
        ? "dropdown-end"
        : "";

$effect(() => {
  if (!isOpen) return;

  const handleOutsideClick = (e) => {
    if (
      !menuElement?.contains(e.target) &&
      !buttonElement?.contains(e.target)
    ) {
      close();
    }
  };

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

<div class={`dropdown ${positionClass}`}>
  <button
    class="rounded-field inline-flex cursor-pointer items-center gap-1 p-2 hover:bg-(--color-bg-hover) focus:bg-(--color-bg-hover) {labelClass}"
    aria-haspopup="true"
    aria-expanded={isOpen}
    onclick={toggle}
    bind:this={buttonElement}>
    {@render label()}
  </button>

  <ul
    class="dropdown-content menu rounded-box mt-1 border-1 border-(--color-bg-300) bg-(--color-bg-200) p-2 shadow"
    style="max-width: {maxMenuWidth}rem;"
    role="menu"
    class:invisible={!isOpen}
    bind:this={menuElement}
    tabindex="-1">
    {#each menuItems as item}
      <li>
        <button
          class="p-2 whitespace-nowrap hover:bg-(--color-bg-300) {item.class}"
          onclick={item.onClick}
          role="menuitem">
          {#if item.icon}
            <item.icon size="18"></item.icon>
          {/if}
          {item.label}
        </button>
      </li>
    {:else}
      <li>Empty list</li>
    {/each}
  </ul>
</div>
