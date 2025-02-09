<script>
  import "./app.css";

  import Sidebar from "./components/Sidebar.svelte";
  import MainView from "./components/MainView.svelte";
</script>

<div
  id="layout"
  class="h-screen grid grid-flow-col grid-cols-[12.5rem_1fr] overflow-hidden"
>
  <Sidebar></Sidebar>
  <MainView></MainView>
</div>

<style>
</style>
