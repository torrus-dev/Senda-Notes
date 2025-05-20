<style>
</style>

<script lang="ts">
import {
   SlidersHorizontalIcon,
   PlusIcon,
   TablePropertiesIcon,
} from "lucide-svelte";
import { workspace } from "@controllers/workspaceController.svelte";
import { notePropertyController } from "@controllers/note/property/notePropertyController.svelte";
import AddPropertyEditor from "@components/note/properties/AddPropertyEditor.svelte";
import Property from "@components/note/properties/Property.svelte";
import Button from "@components/utils/Button.svelte";
import Collapsible from "@components/utils/Collapsible.svelte";

import type { Property as PropertyType } from "@projectTypes/propertyTypes";

let { noteId }: { noteId: string } = $props();

let properties: PropertyType[] = $derived(
   notePropertyController.getNoteProperties(noteId),
);

let addingProperty = $state(false);

function toggleAddProperty() {
   addingProperty = !addingProperty;
}
</script>

{#if noteId}
   {#snippet headingContent()}
      <div class="flex items-center justify-between">
         <div class="flex items-center gap-2">
            <TablePropertiesIcon size="1.125rem" /> Properties
         </div>
         <div>
            <Button class="text-muted-content">
               <SlidersHorizontalIcon size="1.125rem" />
               Manage Properties
            </Button>
         </div>
      </div>
   {/snippet}

   <Collapsible
      headingContent={headingContent}
      chevronPosition="floating-left"
      startCollapsed={workspace.isEditorPropertiesCollapsed()}
      oncollapse={() => {
         workspace.toggleEditorPropertiesCollapsed();
      }}>
      {#if properties.length > 0}
         <!-- Listar propiedades de la nota -->
         <ul class="gap-1">
            {#each properties as property, index (property.id)}
               <Property noteId={noteId} property={property} position={index} />
            {/each}
         </ul>
      {/if}

      {#if addingProperty}
         <div class="relative">
            <AddPropertyEditor
               noteId={noteId}
               onClose={() => {
                  toggleAddProperty();
               }} />
         </div>
      {:else}
         <Button
            class="text-base-content/80"
            onclick={() => {
               toggleAddProperty();
            }}
            title="Add property">
            <PlusIcon size="1.0625em" />Add Property
         </Button>
      {/if}
   </Collapsible>
{/if}
