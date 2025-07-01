<style>
ul {
   li {
      &:after {
         color: var(--color-text-faint);
         content: "/";
      }
   }
}
</style>

<script lang="ts">
import { workspaceController } from "@controllers/navigation/workspaceController.svelte";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";

import Button from "@components/utils/Button.svelte";
import { HomeIcon } from "lucide-svelte";

let { noteId, showHome }: { showHome: boolean; noteId: string } = $props();

let path: { id: string; title: string }[] = $derived(
   noteId ? noteQueryController.getPathAsArray(noteId) : [],
);
</script>

<div aria-label="breadcrumb">
   <ul class="inline-flex items-center">
      {#if showHome}
         <div class="flex items-center">
            <Button
               onclick={() => {
                  workspaceController.unsetActiveTabNoteReference();
               }}
               title="Home">
               <HomeIcon size="1.0625em" />
               >
            </Button>
         </div>
      {/if}
      {#if path}
         {#each path as crumb, index (crumb.id)}
            {#if index !== path.length - 1}
               <li class="text-base-content/60 whitespace-nowrap">
                  <Button
                     size="small"
                     shape="rect"
                     onclick={(event: Event) => {
                        workspaceController.openNote(crumb.id);
                        event.stopPropagation();
                     }}
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
