<!-- Dropdown.svelte -->
<script>
  let {
    dropdownLabel,
    position = "start",
    bordered = false,
    children,
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

<div class="dropdown dropdown-end" class:dropdown-{positon}={posi}>
  <button
    class="btn"
    aria-haspopup="true"
    aria-expanded={isOpen}
    onclick={toggle}
    bind:this={buttonElement}
  >
    <!-- Snippet dropdownLabel -->
    {@render dropdownLabel()}
  </button>

  <ul
    class="dropdown-content menu bg-base-200 w-42"
    role="menu"
    class:b-1={bordered}
    class:b-neutral={bordered}
    class:invisible={!isOpen}
    bind:this={menuElement}
    tabindex="-1"
  >
    {#if children}
      {@render children()}
    {:else}
      <p>no content</p>
    {/if}
  </ul>
</div>
