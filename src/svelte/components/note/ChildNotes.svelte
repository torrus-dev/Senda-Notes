<script lang="ts">
import Button from "@components/utils/Button.svelte";
import Collapsible from "@components/utils/Collapsible.svelte";

import { NetworkIcon, PlusIcon } from "lucide-svelte";
import { workspace } from "@controllers/workspaceController.svelte";
import { noteQueryController } from "@controllers/note/noteQueryController.svelte";

let { children }: { children: string[] } = $props();
</script>

{#snippet headingContent()}
   <div class="flex items-center gap-2">
      <NetworkIcon size="1.125rem" /> Children
   </div>
{/snippet}

{#if children && children.length > 0}
   <Collapsible
      headingContent={headingContent}
      chevronPosition="floating-left"
      startCollapsed={workspace.isEditorChildrenCollapsed()}
      oncollapse={() => {
         workspace.toggleEditorChildrenCollapsed();
      }}>
      <ul class="rounded-field mb-2">
         {#each children as childId}
            <li>
               <Button
                  size="small"
                  shape="rect"
                  onclick={() => workspace.setActiveNoteId(childId)}
                  title="Abrir nota">
                  {noteQueryController.getTitleById(childId)}
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
