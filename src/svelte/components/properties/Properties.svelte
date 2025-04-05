<style>
</style>

<script>
import Property from "./Property.svelte";
import PropertyEditor from "./PropertyEditor.svelte";
import { workspace } from "@controllers/workspaceController.svelte";

import { PlusIcon, TablePropertiesIcon } from "lucide-svelte";
import Button from "@components/utils/Button.svelte";
import Collapsible from "@components/utils/Collapsible.svelte";

let { noteId, properties } = $props();

let isAddPropertyOpen = $derived(workspace.isOpenPropertyEditor());
</script>

{#if noteId && properties}
   {#snippet headingContent()}
      <div class="flex items-center gap-2">
         <TablePropertiesIcon size="1.125rem" /> Properties
      </div>
   {/snippet}

   <Collapsible headingContent={headingContent} chevronPosition="floating-left">
      {#if properties.length > 0}
         <ul class="rounded-lg">
            {#each properties as property, index (property.id)}
               <Property noteId={noteId} property={property} position={index} />
            {/each}
         </ul>
      {/if}

      {#if isAddPropertyOpen}
         <div class="relative">
            <PropertyEditor noteId={noteId} />
         </div>
      {:else}
         <Button
            size="small"
            cssClass="text-base-content/80"
            onclick={() => {
               workspace.openPropertyEditor();
            }}>
            <PlusIcon size="1.125em" />Add Property
         </Button>
      {/if}
   </Collapsible>
{/if}
