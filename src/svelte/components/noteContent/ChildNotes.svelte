<script lang="ts">
import { noteController } from "@controllers/noteController.svelte";
import Button from "@components/utils/Button.svelte";
import Collapsible from "@components/utils/Collapsible.svelte";

import { NetworkIcon } from "lucide-svelte";

let { children } = $props();
</script>

{#snippet headingContent()}
   <div class="flex items-center gap-2">
      <NetworkIcon size="1.125rem" /> Children
   </div>
{/snippet}

{#if children && children.length > 0}
   <Collapsible headingContent={headingContent} chevronLeft={true}>
      <ul class="rounded-field my-2">
         {#each children as childId}
            <li>
               <Button onclick={() => noteController.setActiveNote(childId)}>
                  {noteController.getTitleById(childId)}
               </Button>
            </li>
         {/each}
      </ul>
   </Collapsible>
{/if}
