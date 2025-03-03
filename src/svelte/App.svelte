<style>
</style>

<script>
import "./app.css";

import Sidebar from "./components/layout/Sidebar.svelte";
import MainView from "./components/MainView.svelte";
</script>

<div
  id="layout"
  class="text-base-content grid h-screen grid-flow-col grid-cols-[min-content_1fr] overflow-hidden bg-(--color-base-100)">
  <Sidebar></Sidebar>
  <MainView></MainView>
</div>
