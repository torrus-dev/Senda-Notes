<script lang="ts">
import { Maximize, MinusIcon, XIcon } from "lucide-svelte";
import { onMount } from "svelte";

let isMaximized = $state(false);
let platform = $state("");

onMount(async () => {
   // Verificar si estamos en Electron
   if (typeof window !== "undefined" && window.electronAPI) {
      platform = window.electronAPI.platform;
      isMaximized = await window.electronAPI.isMaximized();
   }
});

async function handleMinimize() {
   if (window.electronAPI) {
      await window.electronAPI.minimize();
   }
}

async function handleMaximize() {
   if (window.electronAPI) {
      await window.electronAPI.maximize();
      isMaximized = await window.electronAPI.isMaximized();
   }
}

async function handleClose() {
   if (window.electronAPI) {
      await window.electronAPI.close();
   }
}
</script>

<div
   class="ml-auto flex w-fit items-center"
   style="-webkit-app-region: no-drag;">
   <button
      class="flex cursor-pointer items-center justify-center border-0 bg-transparent p-3 transition-colors hover:bg-black/10"
      onclick={handleMinimize}
      aria-label="Minimizar">
      <MinusIcon size={20} />
   </button>
   <button
      class="flex cursor-pointer items-center justify-center border-0 bg-transparent p-3 transition-colors hover:bg-black/10"
      onclick={handleMaximize}
      aria-label="Maximizar">
      <Maximize size={20} />
   </button>
   <button
      class="flexcursor-pointer items-center justify-center border-0 bg-transparent p-3 transition-colors hover:bg-red-500/80 hover:text-white"
      onclick={handleClose}
      aria-label="Cerrar">
      <XIcon size={20} />
   </button>
</div>
