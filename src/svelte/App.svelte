<script lang="ts">
import { uiModeController } from "@controllers/ui/uiModeController.svelte";
import MainView from "@components/MainView.svelte";
import { Settings } from "luxon";
import { startupManager } from "./startup/startupManager.svelte";
import LoadingScreen from "@components/LoadingScreen.svelte";

Settings.defaultLocale = "es-ES";

startupManager.launchApp();

uiModeController.applyTheme();
</script>

{#if !startupManger.isReady}
   <LoadingScreen />
{:else}
   <MainView />
{/if}
