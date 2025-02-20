<script>
  import NoteTreeRenderer from "./NoteTreeRenderer.svelte";
  import { onDestroy } from "svelte";

  let sidebarWidth = $state(12.5);

  let isDragging = false;
  let startX = 0;
  let startWidth = 0;

  function startDragging(event) {
    isDragging = true;
    startX = event.clientX;
    startWidth = sidebarWidth;
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", stopDragging);
    document.body.classList.add("cursor-col-resize", "select-none");
  }

  function handleDrag(event) {
    if (!isDragging) return;

    const deltaX = event.clientX - startX;
    const deltaRem = deltaX / 16; // Convertir píxeles a rem (1rem = 16px)
    let newWidth = startWidth + deltaRem;

    // Establecer límites de tamaño
    newWidth = Math.max(8, Math.min(30, newWidth));

    sidebarWidth = newWidth;
  }

  function stopDragging() {
    isDragging = false;
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", stopDragging);
    document.body.classList.remove("cursor-col-resize", "select-none");
  }

  onDestroy(() => {
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", stopDragging);
  });
</script>

<aside class="bg-base-200 relative" style="width: {sidebarWidth}rem;">
  <div
    class="group absolute overflow-visible right-[-0.25rem] top-0 bottom-0 w-[0.75rem] cursor-col-resize z-10"
    role="button"
    tabindex="-1"
    onmousedown={startDragging}
  >
    <div
      class="absolute right-[0.25rem] top-0 bottom-0 w-[0.25rem] bg-(--color-border-muted) group-hover:bg-(--color-border-normal) group-active:bg-(--color-border-normal) transition-colors duration-200"
    ></div>
  </div>
  <div class="overflow-hidden">
    <NoteTreeRenderer />
  </div>
</aside>

<style>
</style>
