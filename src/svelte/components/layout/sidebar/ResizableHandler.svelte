<script>
import { onDestroy } from "svelte";
import { workspace } from "@controllers/workspaceController.svelte";

// Propiedades del componente
let { disabled = false, updateWidth, onResizeStart, onResizeEnd } = $props();

const savedWidth = workspace.getSidebarWidth();
const minWidth = 8;
const maxWidth = 30;

let width = $state(savedWidth ? savedWidth : 12.5);
updateWidth(savedWidth ? savedWidth : 12.5);

// Estado de arrastre con sintaxis runes
let isDragging = $state(false);
let startX = $state(0);
let startWidth = $state(0);

function startDragging(event) {
   if (disabled) return;

   isDragging = true;
   startX = event.clientX;
   startWidth = width;
   document.addEventListener("mousemove", handleDrag);
   document.addEventListener("mouseup", stopDragging);
   document.body.classList.add("cursor-col-resize", "select-none");
   onResizeStart();
}

function handleDrag(event) {
   if (!isDragging) return;

   const deltaX = event.clientX - startX;
   const deltaRem = deltaX / 16; // Convertir píxeles a rem (1rem = 16px)
   let newWidth = startWidth + deltaRem;

   // Establecer límites de tamaño
   newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));

   width = newWidth;
   updateWidth(newWidth);
}

function stopDragging() {
   isDragging = false;
   document.removeEventListener("mousemove", handleDrag);
   document.removeEventListener("mouseup", stopDragging);
   document.body.classList.remove("cursor-col-resize", "select-none");
   workspace.setSidebarWidth(width);
   onResizeEnd();
}

onDestroy(() => {
   document.removeEventListener("mousemove", handleDrag);
   document.removeEventListener("mouseup", stopDragging);
});
</script>

{#if !disabled}
   <div
      class="group absolute top-0 right-[-0.25rem] bottom-0 z-10 w-[0.75rem] cursor-col-resize overflow-visible"
      role="button"
      tabindex="-1"
      onmousedown={startDragging}>
      <div
         class="bg-base-300 group-hover:bg-interactive-accent-hover group-active:bg-interactive-accent-focus absolute top-0 right-[0.25rem] bottom-0 w-0.5 group-hover:w-1">
      </div>
   </div>
{/if}
