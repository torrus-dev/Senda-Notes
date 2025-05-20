<script lang="ts">
import type { Property } from "@projectTypes/propertyTypes";
import { workspace } from "@controllers/workspaceController.svelte";
import { notePropertyController } from "@controllers/note/property/notePropertyController.svelte";
import { onOutsideOrEsc } from "@directives/onOutsideOrEsc";
import { getPropertyIcon, getPropertyTypesList } from "@utils/propertyUtils";
import PropertyNameInput from "@components/note/properties/PropertyNameInput.svelte";
import { globalPropertyController } from "@controllers/note/property/globalPropertyController.svelte";
import type { GlobalProperty } from "@projectTypes/propertyTypes";

let { noteId }: { noteId: string } = $props();

// Estado interno del editor
let newPropertyName: string = $state("");
let newPropertyType: Property["type"] = $state("text");
let selectGlobalProperty: boolean = $state(false);

// Verificamos si el nombre coincide con otra propiedad global cuando cambia en el input
$effect(() => {
   if (newPropertyName) {
      const globalProperty =
         globalPropertyController.getGlobalPropertyByName(newPropertyName);
      if (globalProperty) {
         // Si coincide con una propiedad global, adoptamos su tipo
         newPropertyType = globalProperty.type;
         selectGlobalProperty = true;
      } else {
         // Si no coincide con ninguna global
         selectGlobalProperty = false;
      }
   }
});

// Manejador para cuando se selecciona una propiedad global desde el input
function handleSelectGlobalProperty(globalProperty: GlobalProperty) {
   newPropertyName = globalProperty.name;
   newPropertyType = globalProperty.type;
   selectGlobalProperty = true;
}

// Manejador para cuando cambia el nombre manualmente
function handleNameChange(name: string) {
   newPropertyName = name;

   // Verificamos si existe una propiedad global con este nombre
   const globalProperty =
      globalPropertyController.getGlobalPropertyByName(name);
   if (globalProperty) {
      newPropertyType = globalProperty.type;
      selectGlobalProperty = true;
   } else {
      selectGlobalProperty = false;
   }
}

// Función para guardar los cambios
function handleSave() {
   if (newPropertyName.trim() === "") return;

   // Crear nueva propiedad
   notePropertyController.createProperty(
      noteId,
      newPropertyName,
      newPropertyType,
   );
}

// Cerrar el editor guardando los cambios
function closeEditor() {
   handleSave();
   workspace.closePropertyEditor();
}
</script>

<div
   class="property-editor rounded-box bordered absolute top-full left-0 z-30 mt-1 flex flex-col gap-2 bg-(--color-base-200) px-4 py-2 shadow-lg"
   use:onOutsideOrEsc={{
      action: closeEditor,
   }}
   onkeydown={(event) => {
      if (event.key === "Enter") {
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
         bind:value={newPropertyType}
         disabled={selectGlobalProperty}>
         {#each getPropertyTypesList() as { value, label }}
            {@const TypeIcon = getPropertyIcon(value)}
            <option value={value}>
               {label}
            </option>
         {/each}
      </select>
      {#if selectGlobalProperty}
         <div class="text-base-content/70 mt-1 text-xs">
            Using an existing global property type
         </div>
      {/if}
   </div>
</div>
