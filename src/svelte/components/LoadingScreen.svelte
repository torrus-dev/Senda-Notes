<!-- components/LoadingScreen.svelte -->
<script lang="ts">
import { bootstrapManager } from "../bootstrap/bootstrapManager.svelte";

// Props opcionales para personalizar
interface Props {
   showProgress?: boolean;
   showCurrentStep?: boolean;
   className?: string;
}

let {
   showProgress = true,
   showCurrentStep = true,
   className = "",
}: Props = $props();

// Estado reactivo del bootstrap
let progress = $derived(bootstrapManager.progressPercent);
let currentStep = $derived(bootstrapManager.current);
let initialized = $derived(bootstrapManager.initialized);
</script>

<div
   class="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900 {className}">
   <div class="mx-auto max-w-md space-y-6 px-6 text-center">
      <!-- Logo o título de la app -->
      <div class="space-y-2">
         <div
            class="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
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
         <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Iniciando aplicación
         </h1>
      </div>

      <!-- Barra de progreso -->
      {#if showProgress}
         <div class="w-full space-y-2">
            <div class="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
               <div
                  class="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
                  style="width: {progress}%">
               </div>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
               {progress}% completado
            </div>
         </div>
      {/if}

      <!-- Paso actual -->
      {#if showCurrentStep && currentStep}
         <div class="space-y-1">
            <div class="text-sm text-gray-500 dark:text-gray-400">
               Cargando...
            </div>
            <div
               class="text-lg font-medium text-gray-900 capitalize dark:text-white">
               {currentStep.replace("-", " ")}
            </div>
         </div>
      {/if}

      <!-- Indicador de carga animado -->
      <div class="flex justify-center">
         <div
            class="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 dark:border-gray-600">
         </div>
      </div>
   </div>
</div>
