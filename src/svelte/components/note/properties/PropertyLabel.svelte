<script lang="ts">
import { workspace } from "@controllers/workspaceController.svelte";
import { notePropertyController } from "@controllers/note/property/notePropertyController.svelte";
import { getPropertyIcon } from "@utils/propertyUtils";
import Button from "@components/utils/Button.svelte";
import { SlidersHorizontalIcon, Trash2Icon } from "lucide-svelte";

import type { Note } from "@projectTypes/noteTypes";
import type { Property } from "@projectTypes/propertyTypes";

let {
   noteId,
   property,
   handleDragStart,
   handleDragEnd,
}: {
   noteId: Note["id"];
   property: Property;
   handleDragStart: (event: DragEvent) => void;
   handleDragEnd: (event: DragEvent) => void;
} = $props();
// Obtener el componente de icono actual (derivado)
const IconComponent = $derived(getPropertyIcon(property.type));
</script>

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
               notePropertyController.deleteProperty(property.id, noteId);
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
