<!-- Dropdown.svelte -->
<script>
  let {
    label,
    menuList,
    labelClass = "inline-flex gap-1 p-2 items-center clickable rounded-field",
    position = "start",
    minMenuWidth = 24,
  } = $props();
  let { isOpen } = $state(false);
  let menuElement;
  let buttonElement;

  const close = () => {
    isOpen = false;
  };

  const toggle = () => {
    isOpen = !isOpen;
    console.log("toggle", isOpen);
  };

  const handleKeydown = (e) => {
    if (e.key === "Escape") {
      close();
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  $effect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (
        !menuElement?.contains(e.target) &&
        !buttonElement?.contains(e.target)
      ) {
        console.log("Cerrando por click fuera");
        close();
      }
    };

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

<div
  class="dropdown"
  class:dropdown-start={position === "start"}
  class:dropdown-center={position === "center"}
  class:dropdown-end={position === "end"}
>
  <button
    class={labelClass}
    aria-haspopup="true"
    aria-expanded={isOpen}
    onclick={toggle}
    bind:this={buttonElement}
  >
    {@render label()}
  </button>

  <ul
    class="dropdown-content menu interactive-list bg-base-200 mt-1 b-1 b-neutral shadow min-w-{minMenuWidth}"
    role="menu"
    class:invisible={!isOpen}
    bind:this={menuElement}
    tabindex="-1"
  >
    {#if menuList}
      {@render menuList()}
    {:else}
      <p>no content</p>
    {/if}
  </ul>
</div>

<style>
</style>
