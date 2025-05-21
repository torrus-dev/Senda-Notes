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
   property,
   noteId,
}: {
   property: NoteProperty;
   noteId: string;
} = $props();

// Estado interno del editor
const propertyId = property.id;
const originalName = property.name;
const originalType = property.type;
let newPropertyName: string = $state(originalName);
let newPropertyType: NoteProperty["type"] = $state(originalType);
let wasNameChanged: boolean = $derived(newPropertyName !== originalName);
let originalGlobalProperty = $state<GlobalProperty | undefined>(undefined);
let isGlobalProperty: boolean = $state(false);

// Verificamos si esta propiedad está vinculada a una propiedad global al cargar
$effect(() => {
   if (originalName) {
      const globalProp =
         globalPropertyController.getGlobalPropertyByName(originalName);
      if (globalProp) {
         originalGlobalProperty = globalProp;
         isGlobalProperty = true;
      }
   }
});

// Verificamos si coincide con otra propiedad global cuando cambia el nombre
$effect(() => {
   if (newPropertyName) {
      const globalProperty =
         globalPropertyController.getGlobalPropertyByName(newPropertyName);
      if (globalProperty) {
         // Si coincide con una propiedad global, adoptamos su tipo
         newPropertyType = globalProperty.type;
         isGlobalProperty = true;
      } else if (wasNameChanged) {
         // Si el nombre cambió y no coincide con ninguna global, ya no es global
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

   if (wasNameChanged) {
      // Si cambió el nombre, es una desvinculación o cambio a otra propiedad global
      notePropertyController.handleNotePropertyRename(
         noteId,
         propertyId,
         newPropertyName,
      );

      // También actualizamos el tipo si es necesario
      if (newPropertyType !== originalType) {
         notePropertyController.changeNotePropertyType(
            noteId,
            propertyId,
            newPropertyType,
         );
      }
   } else if (newPropertyType !== originalType) {
      // Si solo cambió el tipo (nombre igual), es un cambio global
      // Este cambio afectará a todas las notas con esta propiedad
      notePropertyController.changeNotePropertyType(
         noteId,
         propertyId,
         newPropertyType,
      );

      // Actualizar también la propiedad global si existe
      if (originalGlobalProperty) {
         globalPropertyController.updateGlobalPropertyType(
            originalGlobalProperty.id,
            newPropertyType,
         );
      }
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
      {#if wasNameChanged}
         <div class="text-base-content/70 mt-1 text-xs">
            Changing name will create a new/different property
         </div>
      {/if}
   </div>
   <div>
      <label for="type" class="inline-block w-[5rem]">Type</label>
      <div class="inline-block w-[16rem]">
         <PropertyTypeSelect
            bind:selectedValue={newPropertyType}
            disabled={isGlobalProperty && wasNameChanged === false} />
      </div>
      {#if isGlobalProperty && !wasNameChanged}
         <div class="text-base-content/70 mt-1 text-xs">
            Type changes will affect all notes with this property
         </div>
      {/if}
   </div>
</div>
