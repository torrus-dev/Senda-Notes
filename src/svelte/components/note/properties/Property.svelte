<style>
</style>

<script lang="ts">
import { createDragAndDropHandlers } from "@utils/dnd/propertyDndEvents";

import PropertyValue from "@components/note/properties/PropertyValue.svelte";
import PropertyLabel from "@components/note/properties/PropertyLabel.svelte";

import type { NoteProperty } from "@projectTypes/propertyTypes";
import { workspace } from "@controllers/workspaceController.svelte";
import { globalPropertyController } from "@controllers/note/property/globalPropertyController.svelte";

let {
   noteId,
   position,
   property,
}: {
   noteId: string;
   position: number;
   property: NoteProperty;
} = $props();

// setup drag and drop
let isDragedOver = $state(false);
const {
   handleDragStart,
   handleDragEnd,
   handleDragOver,
   handleDragLeave,
   handleDrop,
} = createDragAndDropHandlers({
   noteId,
   property,
   getPosition: () => position,
   setIsDraggedOver: (val) => (isDragedOver = val),
});

let isEditingProperty = $derived(
   workspace.isEditingProperty(noteId, property.id),
);

let isTypeMissmatched = $derived(
   !globalPropertyController.checkTypeMatch(property),
);
</script>

<li
   class="
   rounded-field outline-border-normal relative transition-colors duration-300
   {isEditingProperty ? 'outlined bg-interactive-hover' : ''} 
   {isDragedOver ? 'highlight' : ''}
       "
   ondragover={handleDragOver}
   ondragleave={handleDragLeave}
   ondrop={handleDrop}>
   <div class="grid grid-cols-[12rem_auto] gap-0.5">
      <PropertyLabel
         noteId={noteId}
         property={property}
         isEditingProperty={isEditingProperty}
         handleDragStart={handleDragStart}
         handleDragEnd={handleDragEnd} />

      <!-- pasar isTypeMissmatched y mostrarlo con icono -->
      <PropertyValue noteId={noteId} property={property} />
      {#if isTypeMissmatched}
         🚧 Tipo coincide con la propiedad global
      {/if}
   </div>
</li>
