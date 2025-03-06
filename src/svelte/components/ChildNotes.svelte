<script>
import { noteController } from "../controllers/noteController.svelte";
import Button from "./utils/Button.svelte";
let { note } = $props();
let children = $derived(note.children);
</script>

{#if children.length > 0}
  <div>
    <h3 class="text-lg">Notas:</h3>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-4">
      {#each children as childId}
        <Button onclick={() => noteController.setActiveNote(childId)}
          >{noteController.getNoteById(childId).title}</Button>
      {/each}
    </div>
  </div>
{/if}
