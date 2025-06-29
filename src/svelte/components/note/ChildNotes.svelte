<script lang="ts">
import Button from "@components/utils/Button.svelte";
import Collapsible from "@components/utils/Collapsible.svelte";

import { NetworkIcon, PlusIcon } from "lucide-svelte";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";
import { noteNavigationController } from "@controllers/navigation/noteNavigationController.svelte";

let { children }: { children: string[] } = $props();
</script>

{#snippet headingContent()}
   <div class="flex items-center gap-2">
      <NetworkIcon size="1.125rem" /> Children
   </div>
{/snippet}

{#if children && children.length > 0}
   <Collapsible
      id="child-notes"
      headingContent={headingContent}
      chevronPosition="floating-left">
      <ul class="rounded-field mb-2">
         {#each children as childId}
            <li>
               <Button
                  size="small"
                  shape="rect"
                  onclick={() =>
                     (noteNavigationController.activeNoteId = childId)}
                  title="Abrir nota">
                  {noteQueryController.getNoteById(childId)?.title}
               </Button>
            </li>
         {/each}
         <li>
            <Button
               size="small"
               shape="rect"
               class="pl-1.5"
               title="Add child note">
               <PlusIcon size="1.0625em"></PlusIcon> Add Child Note
            </Button>
         </li>
      </ul>
   </Collapsible>
{/if}
