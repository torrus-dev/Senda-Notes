<script>
  import { noteController } from "../noteController.svelte";

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
          <button onclick={() => noteController.setActiveNote(crumb.id)}>
            {crumb.title}
          </button>
        {/if}
      </li>
    {/each}
  </ul>
</div>
