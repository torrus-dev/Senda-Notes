<style>
</style>

<script lang="ts">
import type { Property } from "@projectTypes/propertyTypes";
import { workspace } from "@controllers/workspaceController.svelte";
import { propertyController } from "@controllers/propertyController.svelte";
import { onOutsideOrEsc } from "@directives/onOutsideOrEsc";

let {
   property = undefined,
   noteId,
}: { property?: Property | undefined; noteId: string } = $props();

const propertyId = property ? property.id : null;
const propertyName = property ? property.name : "";
const propertyType = property ? property.type : "text";

let newPropertyName: string = $state(propertyName);
let newPropertyType: Property["type"] = $state(propertyType);

// Opciones de tipos de propiedades
const propertyTypes = [
   { value: "text", label: "Text" },
   { value: "list", label: "List" },
   { value: "number", label: "Number" },
   { value: "check", label: "Check" },
   { value: "date", label: "Date" },
   { value: "datetime", label: "Datetime" },
];

function handleSave() {
   if (newPropertyName !== propertyName || newPropertyType !== propertyType) {
      if (propertyId) {
         // Actualizar propiedad existente
         propertyController.updateProperty(propertyId, {
            name: newPropertyName,
            type: newPropertyType,
         } as Property);
      } else {
         // Comprobar si existe ya la propiedad con ese nombre y agregarla a la nota con el tipo existente
         const existingProperty =
            propertyController.getPropertyByName(newPropertyName);
         // CORREGIR, SOLO DEBES CREAR UNA PROPERTY CON EL MISMO NOMBRE Y LABEL, SI PONES LA MISMA TAMBIEN SE COMPARTE EL VALUE, HABRIA QUE CREAR UN ARRAY DE LABELS EN PROPERTYCONTROLLER / STORE PARA CONTROLAR ESTO Y ADAPTAR FUNCIONES COMO getPropertyByName
         console.log("existingProperty", existingProperty);
         if (existingProperty) {
            propertyController.addPropertyToNote(existingProperty.id, noteId);
         } else if (noteId) {
            // Si no hay id, ni propiedad con ese nombre, entonces crear nueva propiedad
            propertyController.createNewProperty(newPropertyName, noteId);
         }
      }
   }
}

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
      <input
         name="name"
         autofocus
         type="text"
         class="bg-base-100 p-1"
         bind:value={newPropertyName}
         placeholder="Enter property name" />
   </div>
   <div>
      <label for="type" class="inline-block w-[5rem]">Type</label>
      <select
         class="bg-base-100 rounded-field p-1"
         name="type"
         bind:value={newPropertyType}>
         {#each propertyTypes as { value, label }}
            <option class="" value={value}>{label}</option>
         {/each}
      </select>
   </div>
</div>
