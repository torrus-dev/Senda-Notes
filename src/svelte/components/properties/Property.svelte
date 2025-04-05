<style>
</style>

<script>
import { workspace } from "@controllers/workspaceController.svelte";
import { propertyController } from "@controllers/propertyController.svelte";

import { getIconComponent } from "@utils/propertyUtils";
import { createDragAndDropHandlers } from "@utils/dnd/propertyDndEvents";

import { SlidersHorizontalIcon, Trash2Icon } from "lucide-svelte";

import PropertyValue from "./propertyTypes/PropertyValue.svelte";
import PropertyEditor from "./PropertyEditor.svelte";
import Button from "@components/utils/Button.svelte";

let { noteId = null, position, property = null } = $props();

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
const IconComponent = $derived(getIconComponent(property.type));
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
                  id: crypto.randomUUID(),
                  type: "action",
                  label: "Edit Property",
                  icon: SlidersHorizontalIcon,
                  action: () => {
                     workspace.openPropertyEditor(noteId, property.id);
                  },
               },
               {
                  id: crypto.randomUUID(),
                  type: "action",
                  label: "Delete Property",
                  icon: Trash2Icon,
                  action: () => {
                     propertyController.deleteProperty(noteId, property.id);
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
      <PropertyValue noteId={noteId} property={property}></PropertyValue>
   </div>
   {#if isEditorOpen}
      <PropertyEditor noteId={noteId} property={property} />
   {/if}
</li>
