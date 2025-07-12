<!-- LoadingScreen.svelte -->
<script lang="ts">
import { bootstrapManager } from "../bootstrap/bootstrapManager.svelte";

// Props para personalización
interface Props {
   appName?: string;
}

let { appName = "Aplicación" }: Props = $props();

// Función para reintentar en caso de error
const handleRetry = () => {
   bootstrapManager.restart();
};
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900">
   <div class="mx-auto max-w-md px-6 text-center">
      <!-- Logo o icono de la aplicación -->
      <div class="mb-8">
         <div
            class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500">
            <svg
               class="h-8 w-8 text-white"
               fill="none"
               stroke="currentColor"
               viewBox="0 0 24 24">
               <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
         </div>
      </div>

      <!-- Título -->
      <h1 class="mb-2 text-2xl font-bold text-white">{appName}</h1>

      {#if bootstrapManager.phase === "loading"}
         <!-- Estado de carga -->
         <p class="mb-6 text-gray-400">{bootstrapManager.currentStep}</p>

         <!-- Barra de progreso -->
         <div class="mb-4 h-2 w-full rounded-full bg-gray-800">
            <div
               class="h-2 rounded-full bg-blue-500 transition-all duration-300 ease-out"
               style="width: {bootstrapManager.progress}%">
            </div>
         </div>

         <!-- Porcentaje -->
         <p class="text-sm text-gray-500">{bootstrapManager.progress}%</p>

         <!-- Spinner -->
         <div class="mt-6">
            <div
               class="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-blue-500">
            </div>
         </div>
      {:else if bootstrapManager.phase === "error"}
         <!-- Estado de error -->
         <div class="mb-6 text-red-400">
            <svg
               class="mx-auto mb-4 h-12 w-12"
               fill="none"
               stroke="currentColor"
               viewBox="0 0 24 24">
               <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 class="mb-2 text-xl font-semibold">Error de inicialización</h2>
            <p class="mb-4 text-gray-400">
               {bootstrapManager.error || "Ha ocurrido un error inesperado"}
            </p>
            <button
               onclick={handleRetry}
               class="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600">
               Reintentar
            </button>
         </div>
      {:else if bootstrapManager.phase === "ready"}
         <!-- Estado listo (este estado debería durar muy poco) -->
         <div class="text-green-400">
            <svg
               class="mx-auto mb-4 h-12 w-12"
               fill="none"
               stroke="currentColor"
               viewBox="0 0 24 24">
               <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7" />
            </svg>
            <p class="text-lg">¡Aplicación lista!</p>
         </div>
      {/if}
   </div>
</div>
