<style>
</style>

<script>
import "./app.css";

import Sidebar from "./components/Sidebar.svelte";
import MainView from "./components/MainView.svelte";
</script>

<div
  id="layout"
  class="grid h-screen grid-flow-col grid-cols-[min-content_1fr] overflow-hidden bg-(--color-bg-100) text-(--base-content)">
  <!-- Antes: grid-cols-[12.5rem_1fr]  -->
  <Sidebar></Sidebar>
  <MainView></MainView>
</div>
