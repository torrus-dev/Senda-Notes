<style>
</style>

<script lang="ts">
import { workspace } from "@controllers/workspaceController.svelte";

import { createDragAndDropHandlers } from "@utils/dnd/propertyDndEvents";

import PropertyValue from "@components/note/properties/PropertyValue.svelte";
import PropertyLabel from "@components/note/properties/PropertyLabel.svelte";
import PropertyEditor from "@components/note/properties/PropertyEditor.svelte";

import type { Property } from "@projectTypes/propertyTypes";

let {
   noteId,
   position,
   property,
}: {
   noteId: string;
   position: number;
   property: Property;
} = $props();

let isEditorOpen = $derived(
   workspace.isOpenPropertyEditor(noteId, property.id),
);

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
</script>

<li
   class="rounded-field relative transition-colors duration-300 {isDragedOver
      ? 'highlight'
      : ''}"
   ondragover={handleDragOver}
   ondragleave={handleDragLeave}
   ondrop={handleDrop}>
   <div class="grid grid-cols-[12rem_auto] gap-0.5">
      <PropertyLabel
         noteId={noteId}
         property={property}
         handleDragStart={handleDragStart}
         handleDragEnd={handleDragEnd} />
      <PropertyValue noteId={noteId} property={property} />
   </div>
   {#if isEditorOpen}
      <PropertyEditor noteId={noteId} property={property} />
   {/if}
</li>
