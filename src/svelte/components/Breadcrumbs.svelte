<script>
import { noteController } from "../noteController.svelte";
import Button from "./Button.svelte";

let { note = true } = $props();
let path = $derived(noteController.getBreadcrumbPath(note.id));
</script>

<div class="breadcrumbs">
  <ul>
    {#each path as crumb, index (crumb.id)}
      <li>
        {#if index == path.length - 1}
          {crumb.title}
        {:else}
          <Button
            size="small"
            onclick={() => noteController.setActiveNote(crumb.id)}>
            {crumb.title}
          </Button>
        {/if}
      </li>
    {/each}
  </ul>
</div>
