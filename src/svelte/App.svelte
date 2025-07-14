<script lang="ts">
import { uiModeController } from "@controllers/ui/uiModeController.svelte";
import { startupManager } from "@model/startup/startupManager.svelte";
import MainView from "@components/MainView.svelte";
import { Settings } from "luxon";
import LoadingScreen from "@components/LoadingScreen.svelte";

startupManager.launchApp();

let isReady = $derived(startupManager.isReady);

// llamar a uiModeController para que se inicialice
uiModeController;

Settings.defaultLocale = "es-ES";
</script>

{#if !isReady}
   <LoadingScreen />
{:else}
   <MainView />
{/if}
