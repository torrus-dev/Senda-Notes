<script lang="ts">
import type { Note } from "@projectTypes/noteTypes";
import type { GlobalProperty, NoteProperty } from "@projectTypes/propertyTypes";
import type { MenuItem } from "@projectTypes/editorMenuTypes";

import { SquarePenIcon, TextCursorInputIcon, Trash2Icon } from "lucide-svelte";

import { getPropertyIcon, getPropertyTypesList } from "@utils/propertyUtils";

import { notePropertyController } from "@controllers/note/property/notePropertyController.svelte";

import PropertyIcon from "@components/noteProperties/PropertyIcon.svelte";
import Button from "@components/utils/Button.svelte";
import PropertyNameInput from "@components/noteProperties/PropertyNameInput.svelte";
import { propertyEditorController } from "@controllers/ui/propertyEditorController.svelte";

let {
   noteId,
   property,
   isEditingProperty,
   handleDragStart,
   handleDragEnd,
}: {
   noteId: Note["id"];
   property: NoteProperty;
   isEditingProperty: boolean;
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
         propertyEditorController.startEditProperty(noteId, property.id);
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
      },
      class: "text-error",
   },
];

// Funciones para editar propiedades con el componente PropertyNameInput
function renameProperty(newPropertyName: string) {
   notePropertyController.handleNotePropertyRename(
      noteId,
      property.id,
      newPropertyName,
   );
   propertyEditorController.stop();
}

function renamePropertyFromGlobal(globalProperty: GlobalProperty) {
   notePropertyController.handleNotePropertyRename(
      noteId,
      property.id,
      globalProperty.name,
   );
   propertyEditorController.stop();
}
</script>

{#if !isEditingProperty}
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
{:else}
   <div class="rounded-field bg-interactive flex w-full items-center p-1 px-2">
      <PropertyIcon propertyType={property.type} />
      <PropertyNameInput
         property={property}
         noteId={noteId}
         onNameChange={renameProperty}
         onSelectGlobalProperty={renamePropertyFromGlobal} />
   </div>
{/if}
