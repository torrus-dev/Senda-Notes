<style>
</style>

<script>
import NoteTreeRenderer from "../noteTreeDnd/NoteTreeRenderer.svelte";
import { onDestroy } from "svelte";
import Button from "../utils/Button.svelte";
import { SettingsIcon, InfoIcon } from "lucide-svelte";

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

<aside class="relative bg-(--color-base-200)" style="width: {sidebarWidth}rem;">
  <div
    class="group absolute top-0 right-[-0.25rem] bottom-0 z-10 w-[0.75rem] cursor-col-resize overflow-visible"
    role="button"
    tabindex="-1"
    onmousedown={startDragging}>
    <div
      class="absolute top-0 right-[0.25rem] bottom-0 w-0.5 bg-(--color-base-300) group-hover:w-1 group-hover:bg-(--color-bg-hover) group-active:bg-(--color-bg-hover)">
    </div>
  </div>
  <div class="overflow-y-auto">
    <NoteTreeRenderer />
  </div>
  <div>
    <ul
      class="text-base-content/70 border-border-normal absolute bottom-0 left-0 flex w-full gap-0.5 border-t-2 p-2">
      <li>
        <Button>
          <SettingsIcon></SettingsIcon>
        </Button>
      </li>
      <li>
        <Button>
          <InfoIcon></InfoIcon>
        </Button>
      </li>
    </ul>
  </div>
</aside>
