<script lang="ts">
import { workspace } from "@controllers/workspaceController.svelte";
import { notePropertyController } from "@controllers/note/property/notePropertyController.svelte";
import { getPropertyIcon } from "@utils/propertyUtils";
import Button from "@components/utils/Button.svelte";
import ExistingPropertyName from "@components/note/properties/existingPropertyParts/ExistingPropertyName.svelte";
import { SlidersHorizontalIcon, Trash2Icon } from "lucide-svelte";

import type { Note } from "@projectTypes/noteTypes";
import type { GlobalProperty, Property } from "@projectTypes/propertyTypes";
import type { MenuItem } from "@projectTypes/editorMenuTypes";

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

const labelMenuItems: MenuItem[] = [
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
         notePropertyController.deleteProperty(noteId, property.id);
         // close
      },
      class: "text-error",
   },
];

function selectGlobalProperty(globalProperty: GlobalProperty) {
   console.log("ejecutando selectGlobalProperty");
}

function nameChange() {
   console.log("ejecutando nameChange");
}

// Obtener el componente de icono actual (derivado)
const IconComponent = $derived(getPropertyIcon(property.type));
</script>

<div
   draggable="true"
   role="listitem"
   class="flex w-full items-center"
   ondragstart={handleDragStart}
   ondragend={handleDragEnd}>
   <Button
      size="small"
      shape="square"
      contextMenuItems={labelMenuItems}
      dropdownMenuItems={labelMenuItems}>
      {#if IconComponent}
         <span class=""><IconComponent size="1.0625em" /></span>
      {/if}
   </Button>
   <ExistingPropertyName
      savedPropertyName={property.name}
      onselectGlobalProperty={selectGlobalProperty}
      onnameChange={nameChange} />
</div>
