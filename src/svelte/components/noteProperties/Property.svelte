<style>
</style>

<script lang="ts">
import { globalPropertyController } from "@controllers/property/globalPropertyController.svelte";
import { propertyEditorController } from "@controllers/ui/propertyEditorController.svelte";
import { createDragAndDropHandlers } from "@utils/dnd/propertyDndEvents";
import { NoteProperty } from "@domain/entities/NoteProperty";

import PropertyValue from "@components/noteProperties/PropertyValue.svelte";
import PropertyLabel from "@components/noteProperties/PropertyLabel.svelte";
import { TriangleAlertIcon } from "lucide-svelte";
import Button from "@components/utils/Button.svelte";

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
   propertyEditorController.isEditingProperty(noteId, property.id),
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

      <div class="relative">
         <PropertyValue noteId={noteId} property={property} />
         {#if isTypeMissmatched}
            <div class="absolute top-0 right-0">
               <Button class="text-warning" size="large">
                  <TriangleAlertIcon size="1.125em" />
               </Button>
            </div>
         {/if}
      </div>
   </div>
</li>
