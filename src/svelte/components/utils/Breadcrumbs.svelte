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

<script lang="ts">
import { noteController } from "@controllers/noteController.svelte";

import Button from "./Button.svelte";
import InlineTitleEditor from "./InlineTitleEditor.svelte";

let { noteId = undefined }: { noteId: string | undefined } = $props();

let path: { id: string; title: string }[] = $derived(
   noteId ? noteController.getBreadcrumbPath(noteId) : [],
);
let isEditingLastCrumb: boolean = $state(false);
</script>

<div aria-label="breadcrumb">
   <ul class="inline-flex items-center">
      {#if path}
         {#each path as crumb, index (crumb.id)}
            {#if index == path.length - 1}
               <li class="p-1 whitespace-nowrap select-text">
                  <InlineTitleEditor
                     noteId={crumb.id}
                     noteTitle={crumb.title}
                     isEditing={isEditingLastCrumb}
                     onclick={() => {
                        isEditingLastCrumb = true;
                     }}
                     onEditComplete={() => {
                        isEditingLastCrumb = false;
                     }} />
               </li>
            {:else}
               <li class="whitespace-nowrap">
                  <Button
                     size="small"
                     onclick={() => noteController.setActiveNote(crumb.id)}
                     title="Open note">
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
