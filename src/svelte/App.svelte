<style>
</style>

<script lang="ts">
import MainView from "./components/MainView.svelte";
import { Settings } from "luxon";

Settings.defaultLocale = "es-ES";
</script>

<MainView />
