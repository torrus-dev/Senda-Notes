<script lang="ts">
// import { uiModeController } from "@controllers/ui/uiModeController.svelte";
import { startupManager } from "../model/startup/startupManager.svelte";
// import MainView from "@components/MainView.svelte";
import { Settings } from "luxon";
import LoadingScreen from "@components/LoadingScreen.svelte";

startupManager.launchApp();

Settings.defaultLocale = "es-ES";

// uiModeController.applyThemeToHTMLDocument();
</script>

{#if !startupManager.isReady}
   <LoadingScreen />
{:else}
   PATO
   <!-- <MainView /> -->
{/if}
