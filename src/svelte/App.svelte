<!-- App.svelte -->
<script lang="ts">
import { uiModeController } from "@controllers/ui/uiModeController.svelte";
import { bootstrapManager } from "./bootstrap/bootstrapManager.svelte";
import MainView from "@components/MainView.svelte";
import LoadingScreen from "@components/LoadingScreen.svelte";
import { Settings } from "luxon";
import { onMount } from "svelte";

Settings.defaultLocale = "es-ES";

// Aplicar tema inmediatamente (esto no requiere inicialización)
uiModeController.applyTheme();

onMount(() => {
   // Inicializar la aplicación cuando se monta el componente
   bootstrapManager.initialize();
});

// Agregar un effect para monitorear el estado
$effect(() => {
   console.log("App: Bootstrap state changed:", {
      isReady: bootstrapManager.isReady,
      phase: bootstrapManager.phase,
      progress: bootstrapManager.progress,
   });
});
</script>

{#if !bootstrapManager.isReady}
   <LoadingScreen />
{:else}
   <MainView />
{/if}
