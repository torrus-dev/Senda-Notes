<style>
</style>

<script>
import "./css/app.css";
import MainView from "./components/layout/MainView.svelte";
import { Settings } from "luxon";

Settings.defaultLocale = "es-ES";
</script>

<MainView></MainView>
