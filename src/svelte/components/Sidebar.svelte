<script>
  import NoteTreeRenderer from "./NoteTreeRenderer.svelte";

  let sidebarWidth = $state(12.5);
</script>

<aside class="bg-base-200 overflow-hidden" style="width: {sidebarWidth}rem;">
  <NoteTreeRenderer></NoteTreeRenderer>
</aside>

<style>
</style>
