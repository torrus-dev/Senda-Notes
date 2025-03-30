<style>
</style>

<script>
import Property from "./Property.svelte";
import PropertyEditor from "./PropertyEditor.svelte";
import { workspace } from "@controllers/workspaceController.svelte";

import { PlusIcon } from "lucide-svelte";
import Button from "@components/utils/Button.svelte";

let { note } = $props();

let isAddPropertyOpen = $derived(workspace.isOpenPropertyEditor());
</script>

{#if note}
   <div class="custom-properties my-8">
      <h3 class="mb-2 text-xl font-bold">Properties</h3>
      {#if note.properties && note.properties.length > 0}
         <ul class="rounded-lg">
            {#each note.properties as property, index (property.id)}
               <Property
                  noteId={note.id}
                  property={property}
                  position={index} />
            {/each}
         </ul>
      {/if}

      {#if isAddPropertyOpen}
         <div class="relative">
            <PropertyEditor noteId={note.id} />
         </div>
      {:else}
         <Button
            cssClass="ml-[-.5rem] text-base-content/80"
            onclick={() => {
               workspace.openPropertyEditor();
            }}>
            <PlusIcon size="1.125em" />Add Property
         </Button>
      {/if}
   </div>
{/if}
