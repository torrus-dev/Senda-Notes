<style>
</style>

<script lang="ts">
import { SlidersHorizontalIcon, Trash2Icon } from "lucide-svelte";
import { workspace } from "@controllers/workspaceController.svelte";
import { notePropertyController } from "@controllers/notePropertyController.svelte";

import { getPropertyIcon } from "@utils/propertyUtils";
import { createDragAndDropHandlers } from "@utils/dnd/propertyDndEvents";

import PropertyValue from "@components/noteView/properties/propertyTypes/PropertyValue.svelte";
import PropertyEditor from "@components/noteView/properties/PropertyEditor.svelte";
import Button from "@components/utils/Button.svelte";

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

// Obtener el componente de icono actual (derivado)
const IconComponent = $derived(getPropertyIcon(property.type));
</script>

<li
   class="bg-transaprent rounded-field relative transition-colors duration-300 {isDragedOver
      ? 'highlight'
      : ''}"
   ondragover={handleDragOver}
   ondragleave={handleDragLeave}
   ondrop={handleDrop}>
   <div class="grid grid-cols-[12rem_auto]">
      <div
         draggable="true"
         role="listitem"
         ondragstart={handleDragStart}
         ondragend={handleDragEnd}>
         <Button
            size="small"
            contextMenuItems={[
               {
                  type: "action",
                  label: "Edit Property",
                  icon: SlidersHorizontalIcon,
                  action: () => {
                     workspace.openPropertyEditor(noteId, property.id);
                  },
               },
               {
                  type: "action",
                  label: "Delete Property",
                  icon: Trash2Icon,
                  action: () => {
                     notePropertyController.deletePropertyFromNote(
                        property.id,
                        noteId,
                     );
                     // close
                  },
                  class: "text-error",
               },
            ]}>
            {#if IconComponent}
               <span class=""><IconComponent size="1.0625em" /></span>
            {/if}
            <p class="w-[9rem] overflow-clip text-left">
               {property.name}
            </p>
         </Button>
      </div>
      <PropertyValue property={property}></PropertyValue>
   </div>
   {#if isEditorOpen}
      <PropertyEditor noteId={noteId} property={property} />
   {/if}
</li>
