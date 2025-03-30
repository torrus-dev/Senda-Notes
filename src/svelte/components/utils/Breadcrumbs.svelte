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
import { noteController } from "@controllers/noteController.svelte";
import Button from "./Button.svelte";
import InlineTitleEditor from "./InlineTitleEditor.svelte";

let { note } = $props();
let path = $derived(note ? noteController.getBreadcrumbPath(note.id) : null);

// Estado para controlar si la última miga está en modo edición
let isEditingLastCrumb = $state(false);

// Función para iniciar la edición de la última miga
const startEditing = () => {
   isEditingLastCrumb = true;
};

// Función para terminar la edición
const finishEditing = () => {
   isEditingLastCrumb = false;
};
</script>

<div aria-label="breadcrumb">
   <ul class="inline-flex items-center">
      {#if path}
         {#each path as crumb, index (crumb.id)}
            {#if index == path.length - 1}
               <li class="p-1 whitespace-nowrap select-text">
                  <InlineTitleEditor
                     note={crumb}
                     isEditing={isEditingLastCrumb}
                     onEditComplete={finishEditing}
                     onclick={startEditing} />
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
