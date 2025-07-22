<style>
</style>

<script lang="ts">
import { SlidersHorizontalIcon, PlusIcon, ShapesIcon } from "lucide-svelte";
import { NoteProperty } from "@domain/entities/NoteProperty";
import { notePropertyController } from "@controllers/property/NotePropertyController.svelte";

import Button from "@components/utils/Button.svelte";
import Collapsible from "@components/utils/Collapsible.svelte";
import Property from "@components/noteProperties/Property.svelte";
import NewProperty from "@components/noteProperties/NewProperty.svelte";
import { propertyEditorController } from "@controllers/ui/PropertyEditorController.svelte";

let { noteId }: { noteId: string } = $props();

let properties: NoteProperty[] = $derived(
   notePropertyController.getNoteProperties(noteId),
);

let isAddingProperty = $derived(propertyEditorController.isAddingProperty());
</script>

{#if noteId}
   {#snippet headingContent()}
      <div class="flex items-center gap-2">
         <ShapesIcon size="1.125rem" /> Properties
      </div>
   {/snippet}
   {#snippet additionalContent()}
      <Button class="text-muted-content">
         <SlidersHorizontalIcon size="1.125rem" />
         Manage Properties
      </Button>
   {/snippet}

   <Collapsible
      id="note-properties"
      headingContent={headingContent}
      additionalContent={additionalContent}
      chevronPosition="floating-left">
      <!-- Listar propiedades de la nota -->
      <ul class="gap-1">
         {#if properties.length > 0}
            {#each properties as property, index (property.id)}
               <Property noteId={noteId} property={property} position={index} />
            {/each}
         {/if}
         {#if isAddingProperty}
            <NewProperty noteId={noteId} />
         {:else}
            <li>
               <Button
                  class="text-base-content/80"
                  onclick={(event) => {
                     propertyEditorController.startAddProperty();
                     event.stopPropagation();
                     event.preventDefault();
                  }}
                  title="Add property">
                  <PlusIcon size="1.0625em" />Add Property
               </Button>
            </li>
         {/if}
      </ul>
   </Collapsible>
{/if}
