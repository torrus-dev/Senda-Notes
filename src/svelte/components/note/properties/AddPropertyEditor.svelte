<script lang="ts">
import type { NoteProperty } from "@projectTypes/propertyTypes";
import { workspace } from "@controllers/workspaceController.svelte";
import { notePropertyController } from "@controllers/note/property/notePropertyController.svelte";
import { onOutsideOrEsc } from "@directives/onOutsideOrEsc";
import PropertyNameInput from "./PropertyNameInput.svelte";
import PropertyTypeSelect from "./PropertyTypeSelect.svelte";
import { globalPropertyController } from "@controllers/note/property/globalPropertyController.svelte";
import type { GlobalProperty } from "@projectTypes/propertyTypes";

let {
   noteId,
   onClose,
}: {
   noteId: string;
   onClose: () => void;
} = $props();

// Estado interno del editor
let newPropertyName: string = $state("");
let newPropertyType: NoteProperty["type"] = $state("text");
let isGlobalProperty: boolean = $state(false);

// Verificamos si coincide con otra propiedad global cuando cambia el nombre
$effect(() => {
   if (newPropertyName) {
      const globalProperty =
         globalPropertyController.getGlobalPropertyByName(newPropertyName);
      if (globalProperty) {
         // Si coincide con una propiedad global, adoptamos su tipo
         newPropertyType = globalProperty.type;
         isGlobalProperty = true;
      } else {
         // Si no coincide con ninguna global
         isGlobalProperty = false;
      }
   }
});

// Manejador para cuando se selecciona una propiedad global desde el input
function handleSelectGlobalProperty(globalProperty: GlobalProperty) {
   newPropertyName = globalProperty.name;
   newPropertyType = globalProperty.type;
   isGlobalProperty = true;
}

// Manejador para cuando cambia el nombre manualmente
function handleNameChange(name: string) {
   newPropertyName = name;

   // Verificamos si existe una propiedad global con este nombre
   const globalProperty =
      globalPropertyController.getGlobalPropertyByName(name);
   if (globalProperty) {
      newPropertyType = globalProperty.type;
      isGlobalProperty = true;
   } else {
      isGlobalProperty = false;
   }
}

// Función para guardar los cambios
function handleSave() {
   if (newPropertyName.trim() === "") return;

   // Crear nueva propiedad
   notePropertyController.handleCreateNoteProperty(
      noteId,
      newPropertyName,
      newPropertyType,
   );
}

// Cerrar el editor guardando los cambios
function closeEditor() {
   handleSave();
   onClose();
}
</script>

<div
   class="property-editor rounded-box bordered bg-base-200 mt-1 flex flex-col gap-2 px-5 py-4 shadow-lg"
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
      <label class="inline-block w-[3rem]" for="name">Name</label>
      <div class="inline-block w-[16rem]">
         <PropertyNameInput
            value={newPropertyName}
            onchange={handleNameChange}
            onSelectGlobalProperty={handleSelectGlobalProperty} />
      </div>
   </div>
   <div>
      <label
         for="type"
         class="{isGlobalProperty ? 'text-muted-content' : ''} 
            inline-block w-[3rem]">Type</label>
      <div class="inline-block w-[16rem]">
         <PropertyTypeSelect
            bind:selectedValue={newPropertyType}
            disabled={isGlobalProperty} />
      </div>
      {#if isGlobalProperty}
         <div class="text-base-content/70 mt-1 text-xs">
            Using an existing global property type
         </div>
      {/if}
   </div>
</div>
