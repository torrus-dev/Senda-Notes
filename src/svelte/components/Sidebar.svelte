<script>
  import NoteTreeRenderer from "./NoteTreeRenderer.svelte";

  let sidebarWidth = $state(42.5);
</script>

<aside class="bg-base-200 w-[{sidebarWidth}rem] overflow-hidden">
  <NoteTreeRenderer></NoteTreeRenderer>
</aside>

<style>
</style>
