<script>
  import { noteController } from "../noteController.svelte";
  import NoteTreeRenderer from "./NoteTreeRenderer.svelte";
</script>

<aside class="bg-base-200 flex-col gap-2">
  <button
    class="btn mb-4 btn-success"
    onclick={() => noteController.createNote()}
  >
    New Root Note
  </button>
  <NoteTreeRenderer></NoteTreeRenderer>
</aside>

<style>
</style>
