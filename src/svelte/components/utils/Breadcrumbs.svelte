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
   li:first-child {
      &:after {
         margin-left: 0;
      }
   }
}
</style>

<script lang="ts">
import Button from "./Button.svelte";
import InlineTitleEditor from "./InlineTitleEditor.svelte";
import { HomeIcon } from "lucide-svelte";
import { workspace } from "@controllers/workspaceController.svelte";
import { noteQueryController } from "@controllers/noteQueryController.svelte";

let { noteId = undefined }: { noteId: string | undefined } = $props();

let path: { id: string; title: string }[] = $derived(
   noteId ? noteQueryController.getBreadcrumbPath(noteId) : [],
);
let isEditingLastCrumb: boolean = $state(false);
</script>

<div aria-label="breadcrumb">
   <ul class="inline-flex items-center">
      <li class="text-base-content/60 flex items-center gap-1">
         <Button
            shape="square"
            onclick={() => {
               workspace.unsetActiveNoteId();
            }}
            title="Open note">
            <HomeIcon size="1.125em" />
         </Button>
      </li>
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
               <li class="text-base-content/60 whitespace-nowrap">
                  <Button
                     size="small"
                     onclick={() => workspace.setActiveNoteId(crumb.id)}
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
