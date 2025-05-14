<script lang="ts">
import type { Property } from "@projectTypes/propertyTypes";
import { workspace } from "@controllers/workspaceController.svelte";
import { notePropertyController } from "@controllers/note/property/notePropertyController.svelte";
import { globalPropertyController } from "@controllers/note/property/globalPropertyController.svelte";

import { onOutsideOrEsc } from "@directives/onOutsideOrEsc";
import { getPropertyIcon, getPropertyTypesList } from "@utils/propertyUtils";
import PropertyNameInput from "@components/note/properties/PropertyNameInput.svelte";

import type { GlobalProperty } from "@projectTypes/propertyTypes";

let {
   property = undefined,
   noteId,
}: { property?: Property | undefined; noteId: string } = $props();

// Estado interno del editor
const propertyId = property ? property.id : undefined;
let newPropertyName: string = $state(property ? property.name : "");
let newPropertyType: Property["type"] = $state(
   property ? property.type : "text",
);
let isGlobalPropertySelected: boolean = $state(false);

// Verificamos si ya existe una propiedad global con este nombre al cargar
$effect(() => {
   if (newPropertyName) {
      const globalProperty =
         globalPropertyController.getGlobalPropertyByName(newPropertyName);
      if (globalProperty) {
         isGlobalPropertySelected = true;
         // Si el tipo no coincide con el de la propiedad global, lo actualizamos
         if (newPropertyType !== globalProperty.type) {
            newPropertyType = globalProperty.type;
         }
      } else {
         isGlobalPropertySelected = false;
      }
   }
});

// Manejador para cuando se selecciona una propiedad global desde el input
function handleSelectGlobalProperty(globalProperty: GlobalProperty) {
   newPropertyName = globalProperty.name;
   newPropertyType = globalProperty.type;
   isGlobalPropertySelected = true;
}

// Manejador para cuando cambia el nombre manualmente
function handleNameChange(name: string) {
   newPropertyName = name;

   // Verificamos si existe una propiedad global con este nombre
   const globalProperty =
      globalPropertyController.getGlobalPropertyByName(name);
   if (globalProperty) {
      newPropertyType = globalProperty.type;
      isGlobalPropertySelected = true;
   } else {
      isGlobalPropertySelected = false;
   }
}

// Función para guardar los cambios
function handleSave() {
   if (newPropertyName.trim() === "") return;

   if (propertyId) {
      // Actualizar propiedad existente
      if (newPropertyName !== property?.name) {
         notePropertyController.renameNoteProperty(
            noteId,
            propertyId,
            newPropertyName,
         );
      }
      if (newPropertyType !== property?.type) {
         notePropertyController.changeNotePropertyType(
            noteId,
            propertyId,
            newPropertyType,
         );
      }
   } else {
      // Crear nueva propiedad
      notePropertyController.createProperty(
         noteId,
         newPropertyName,
         newPropertyType,
      );
   }
}

// Cerrar el editor guardando los cambios
function closeEditor() {
   handleSave();
   workspace.closePropertyEditor();
}
</script>

<div
   class="property-editor rounded-box bordered bg-base-200 absolute top-full left-0 z-30 mt-1 flex flex-col gap-2 px-4 py-2 shadow-lg"
   use:onOutsideOrEsc={{
      action: closeEditor,
   }}
   onkeydown={(event: KeyboardEvent) => {
      if (
         event.key === "Enter" &&
         event.target &&
         (event.target as HTMLElement).tagName !== "INPUT"
      ) {
         closeEditor();
      }
   }}
   role="menu"
   tabindex="-1">
   <div class="form-group">
      <label class="inline-block w-[5rem]" for="name">Name</label>
      <div class="inline-block w-[16rem]">
         <PropertyNameInput
            value={newPropertyName}
            onchange={handleNameChange}
            onSelectGlobalProperty={handleSelectGlobalProperty} />
      </div>
   </div>
   <div>
      <label for="type" class="inline-block w-[5rem]">Type</label>
      <select
         class="bg-base-100 rounded-field w-[16rem] p-1"
         name="type"
         oninput={() => handleSave()}
         bind:value={newPropertyType}
         disabled={isGlobalPropertySelected}>
         {#each getPropertyTypesList() as { value, label }}
            {@const TypeIcon = getPropertyIcon(value)}
            <option value={value}>
               {label}
            </option>
         {/each}
      </select>
      {#if isGlobalPropertySelected}
         <div class="text-base-content/70 mt-1 text-xs">
            Type is locked because you selected an existing property
         </div>
      {/if}
   </div>
</div>
