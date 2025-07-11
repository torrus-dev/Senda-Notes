<!-- App.svelte (ACTUALIZADO) -->
<script lang="ts">
import { onMount } from "svelte";
import { uiModeController } from "@controllers/ui/uiModeController.svelte";
import MainView from "@components/MainView.svelte";
import LoadingScreen from "@components/LoadingScreen.svelte";
import { bootstrapManager } from "./bootstrap/bootstrapManager.svelte";
import { registerBootstrapSteps } from "./bootstrap/bootstrapSteps";
import { Settings } from "luxon";

Settings.defaultLocale = "es-ES";

// Estado de inicialización
let isInitialized = $state(false);
let initializationError = $state<string | null>(null);

onMount(async () => {
   try {
      // Aplicar tema inmediatamente (esto no depende de otros models)
      uiModeController.applyTheme();

      // Registrar todos los pasos de inicialización
      registerBootstrapSteps();

      // Ejecutar el proceso de bootstrap
      await bootstrapManager.initialize();

      // Marcar como inicializado
      isInitialized = true;
   } catch (error) {
      console.error("Error durante la inicialización:", error);
      initializationError =
         error instanceof Error ? error.message : "Error desconocido";
   }
});

// Estado reactivo del bootstrap manager
let bootstrapInitialized = $derived(bootstrapManager.initialized);
</script>

{#if initializationError}
   <!-- Pantalla de error -->
   <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-red-50 dark:bg-red-900/20">
      <div class="mx-auto max-w-md space-y-4 px-6 text-center">
         <div
            class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
            <svg
               class="h-8 w-8 text-red-600 dark:text-red-400"
               fill="none"
               stroke="currentColor"
               viewBox="0 0 24 24">
               <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
         </div>
         <h1 class="text-xl font-bold text-red-900 dark:text-red-100">
            Error de inicialización
         </h1>
         <p class="text-sm text-red-700 dark:text-red-300">
            {initializationError}
         </p>
         <button
            class="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
            onclick={() => window.location.reload()}>
            Reintentar
         </button>
      </div>
   </div>
{:else if !isInitialized || !bootstrapInitialized}
   <!-- Pantalla de carga -->
   <LoadingScreen />
{:else}
   <!-- Aplicación principal -->
   <MainView />
{/if}
