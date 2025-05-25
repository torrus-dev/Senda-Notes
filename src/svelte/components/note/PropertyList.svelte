<style>
</style>

<script lang="ts">
import type { NoteProperty as PropertyType } from "@projectTypes/propertyTypes";

import {
   SlidersHorizontalIcon,
   PlusIcon,
   TablePropertiesIcon,
} from "lucide-svelte";

import { workspace } from "@controllers/workspaceController.svelte";
import { notePropertyController } from "@controllers/note/property/notePropertyController.svelte";

import Button from "@components/utils/Button.svelte";
import Collapsible from "@components/utils/Collapsible.svelte";
import Property from "@components/noteProperties/Property.svelte";
import NewProperty from "@components/noteProperties/NewProperty.svelte";

let { noteId }: { noteId: string } = $props();

let properties: PropertyType[] = $derived(
   notePropertyController.getNoteProperties(noteId),
);

let isAddingProperty = $derived(workspace.isAddingProperty());
</script>

{#if noteId}
   {#snippet headingContent()}
      <div class="flex items-center gap-2">
         <TablePropertiesIcon size="1.125rem" /> Properties
      </div>
   {/snippet}
   {#snippet additionalContent()}
      <Button class="text-muted-content">
         <SlidersHorizontalIcon size="1.125rem" />
         Manage Properties
      </Button>
   {/snippet}

   <Collapsible
      headingContent={headingContent}
      additionalContent={additionalContent}
      chevronPosition="floating-left"
      startCollapsed={workspace.isEditorPropertiesCollapsed()}
      oncollapse={() => {
         workspace.toggleEditorPropertiesCollapsed();
      }}>
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
                     workspace.toggleAddProperty();
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
