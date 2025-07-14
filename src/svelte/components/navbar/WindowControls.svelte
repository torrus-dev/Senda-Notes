<script lang="ts">
import { MaximizeIcon, MinimizeIcon, MinusIcon, XIcon } from "lucide-svelte";
import { onMount } from "svelte";

let isMaximized = $state(true);
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

<button
   class="bg-interactive cursor-pointer border-0 p-3 transition-colors"
   onclick={handleMinimize}
   aria-label="Minimizar">
   <MinusIcon size={20} />
</button>
<button
   class="bg-interactive cursor-pointer border-0 p-3 transition-colors"
   onclick={handleMaximize}
   aria-label="Maximizar">
   {#if isMaximized}
      <MaximizeIcon size={20} />
   {:else}
      <MinimizeIcon size={20} />
   {/if}
</button>
<button
   class="cursor-pointer border-0 p-3 transition-colors hover:bg-red-500/80 hover:text-white"
   onclick={handleClose}
   aria-label="Cerrar">
   <XIcon size={20} />
</button>
