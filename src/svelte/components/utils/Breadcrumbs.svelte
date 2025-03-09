<style>
ul {
  li:not(:last-child) {
    &:after {
      color: var(--color-text-faint);
      content: "/";
      margin-left: var(--spacing);
      margin-right: var(--spacing);
    }
  }
}
</style>

<script>
import { noteController } from "../../controllers/noteController.svelte";
import Button from "./Button.svelte";

let { note } = $props();
let path = $derived(note ? noteController.getBreadcrumbPath(note.id) : null);
</script>

<div aria-label="breadcrumb">
  <ul class="inline-flex items-center">
    {#if path}
      {#each path as crumb, index (crumb.id)}
        {#if index == path.length - 1}
          <li class="p-1 whitespace-nowrap select-text">
            {crumb.title}
          </li>
        {:else}
          <li class="whitespace-nowrap">
            <Button
              size="small"
              onclick={() => noteController.setActiveNote(crumb.id)}>
              {crumb.title}
            </Button>
          </li>
        {/if}
      {/each}
    {:else}
      <li class="p-1 whitespace-nowrap select-text">Inicio</li>
    {/if}
  </ul>
</div>
