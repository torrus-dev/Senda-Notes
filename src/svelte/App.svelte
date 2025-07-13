<script lang="ts">
import { uiModeController } from "@controllers/ui/uiModeController.svelte";
import { startupManager } from "@model/startup/startupManager.svelte";
import MainView from "@components/MainView.svelte";
import { Settings } from "luxon";
import LoadingScreen from "@components/LoadingScreen.svelte";

startupManager.launchApp();

let isReady = $derived(startupManager.isReady);

Settings.defaultLocale = "es-ES";
</script>

{#if !isReady}
   <LoadingScreen />
{:else}
   <!-- Modificar uiModeController internamente para que se aplique lo que tenga "system" hasta que esten disponibles las settings y volver a cargar con un effect cuando startupManager.isReady para no darle un flashazo al usuario -->
   {uiModeController.applyThemeToHTMLDocument()}
   <MainView />
{/if}
