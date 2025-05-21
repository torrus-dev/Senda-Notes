<script lang="ts">
import type { Note } from "@projectTypes/noteTypes";
import type { GlobalProperty, NoteProperty } from "@projectTypes/propertyTypes";
import type { MenuItem } from "@projectTypes/editorMenuTypes";

import { SquarePenIcon, TextCursorInputIcon, Trash2Icon } from "lucide-svelte";

import { getPropertyIcon, getPropertyTypesList } from "@utils/propertyUtils";

import { notePropertyController } from "@controllers/note/property/notePropertyController.svelte";
import { workspace } from "@controllers/workspaceController.svelte";

import PropertyIcon from "@components/note/properties/PropertyIcon.svelte";
import Button from "@components/utils/Button.svelte";

let {
   noteId,
   property,
   handleDragStart,
   handleDragEnd,
}: {
   noteId: Note["id"];
   property: NoteProperty;
   handleDragStart: (event: DragEvent) => void;
   handleDragEnd: (event: DragEvent) => void;
} = $props();

const propertyTypesMenuItems: MenuItem[] = getPropertyTypesList().map(
   (option) => ({
      type: "action",
      label: option.label,
      icon: getPropertyIcon(option.value),
      action: () => {
         notePropertyController.changeNotePropertyType(
            noteId,
            property.id,
            option.value,
         );
      },
   }),
);

const labelMenuItems: MenuItem[] = [
   {
      type: "action",
      label: "Rename Property",
      icon: TextCursorInputIcon,
      action: () => {
         workspace.openPropertyEditor(noteId, property.id);
      },
   },
   {
      type: "group",
      label: "Property Type",
      icon: SquarePenIcon,
      children: propertyTypesMenuItems,
   },
   { type: "separator" },
   {
      type: "action",
      label: "Delete Property",
      icon: Trash2Icon,
      action: () => {
         notePropertyController.deletePropertyFromNote(noteId, property.id);
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
</script>

<div
   draggable="true"
   role="listitem"
   class="flex w-full items-center"
   ondragstart={handleDragStart}
   ondragend={handleDragEnd}>
   <Button dropdownMenuItems={labelMenuItems} class="w-full">
      <PropertyIcon propertyType={property.type} />
      {property.name}
   </Button>
</div>
