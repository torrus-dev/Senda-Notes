<style>
</style>

<script lang="ts">
import { uiModeController } from "@controllers/ui/uiModeController.svelte";
import MainView from "@components/MainView.svelte";
import { Settings } from "luxon";

Settings.defaultLocale = "es-ES";

uiModeController.applyTheme();
</script>

<MainView />
