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
import PropertyNameInput from "@components/note/properties/PropertyNameInput.svelte";
import { onOutsideOrEsc } from "@directives/onOutsideOrEsc";

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
         workspace.toggleEditProperty(noteId, property.id);
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

function handleSelectGlobalProperty(globalProperty: GlobalProperty) {
   console.log("ejecutando selectGlobalProperty");
}

function handlePropertyRename() {
   console.log("ejecutando nameChange");
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
   <div
      class="rounded-field bg-interactive flex w-full items-center p-1 px-2"
      use:onOutsideOrEsc={{
         action: () => {
            // 1. REVISAR ESTO, NO QUEREMOS HACER ESTO SIEMPRE HABRIA QUE PENSAR EL COMPORTAMIENTO PARA RENOMBRAR UNA PROPIEDAD EXISTENTE, con ESC igual si seria cancelar pero con clickOutside habría que pensar si queremos guardar.

            // 2. Luego tambien hay que controlar en PROPERTYNAMEINPUT que no se pueda poner un nombre de una propiedad que ya existe en la nota, es decir no permitir salir hasta que pongas un nombre valido o canceles, bloquear la salida es un comportamiento deseado.

            // 3. Luego tambien habria que mostrar un aviso si hay un missmatch de tipos entre la propiedad de la nota y la propiedad global con la que este vinculada
            workspace.stopPropertyEdit();
         },
      }}>
      <PropertyIcon propertyType={property.type} />
      <PropertyNameInput
         property={property}
         noteId={noteId}
         onNameChange={handlePropertyRename}
         onSelectGlobalProperty={handleSelectGlobalProperty} />
   </div>
{/if}
