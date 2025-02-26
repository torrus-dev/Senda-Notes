<style>
</style>

<script>
import { workspace } from "../controllers/workspaceController.svelte";
import { noteController } from "../controllers/noteController.svelte";
import { XIcon, Trash2Icon, SaveIcon } from "lucide-svelte";
import Button from "./Button.svelte";

// Opciones de tipos de propiedades
const propertyTypes = [
  { value: "text", label: "Text" },
  { value: "list", label: "List" },
  { value: "number", label: "Number" },
  { value: "check", label: "Check" },
  { value: "date", label: "Date" },
  { value: "datetime", label: "Datetime" },
];

// Estado local para nueva propiedad
let newPropertyName = $state("");
let newPropertyType = $state("text");
let noteId = $derived(workspace.state.propertyEditor.targetNoteId);

// Propiedad en edición (si existe)
const editingProperty = $derived(
  workspace.state.propertyEditor.editingProperty,
);
const isEditing = $derived(!!editingProperty);

// Reiniciar valores cuando cambia el modo
$effect(() => {
  if (isEditing) {
    newPropertyName = editingProperty.name;
    newPropertyType = editingProperty.type;
  } else {
    newPropertyName = "";
    newPropertyType = "text";
  }
});

// Manejo de la creación de una nueva propiedad
function handleAddProperty() {
  if (!noteId || !newPropertyName.trim()) {
    alert("Property name is required");
    return;
  }

  const note = noteController.getNoteById(noteId);
  if (!note) return;

  // Validar nombre único
  if (note.properties.some((p) => p.name === newPropertyName.trim())) {
    alert("Property name must be unique");
    return;
  }

  // Usar el método createProperty para crear la propiedad
  noteController.createProperty(noteId, {
    name: newPropertyName.trim(),
    type: newPropertyType,
    value: undefined, // se asigna por defecto según el tipo
  });

  // Limpiar el estado
  newPropertyName = "";
  newPropertyType = "text";

  // Cerrar el editor
  workspace.closePropertyEditor();
}

// Manejo de la actualización de una propiedad existente
function handleUpdateProperty() {
  const noteId = workspace.state.propertyEditor.targetNoteId;
  if (!noteId || !editingProperty) return;

  const note = noteController.getNoteById(noteId);
  if (!note) return;

  // Validar nombre único (excepto si no se ha modificado)
  if (
    newPropertyName.trim() !== workspace.state.propertyEditor.originalName &&
    note.properties.some((p) => p.name === newPropertyName.trim())
  ) {
    alert("Property name must be unique");
    return;
  }

  // Usar updateProperty para actualizar la propiedad
  noteController.updateProperty(noteId, editingProperty.id, {
    name: newPropertyName.trim(),
    type: newPropertyType,
  });

  workspace.closePropertyEditor();
}

// Manejo de la eliminación de la propiedad
function handleDeleteProperty() {
  if (!noteId || !editingProperty) return;
  noteController.deleteProperty(noteId, editingProperty.id);
  workspace.closePropertyEditor();
}
</script>

<div
  class="property-editor rounded-box bordered relative mt-2 bg-(--color-base-200) p-6 shadow">
  <h3 class="inset mb-3 text-xl font-bold">Property Editor</h3>
  <Button
    cssClass="absolute top-1 right-1"
    onclick={workspace.closePropertyEditor}>
    <XIcon />
  </Button>

  <div class="py-2">
    <label for="type" class="inline-block w-[5rem]">Type</label>
    <select class="p-1" name="type" bind:value={newPropertyType}>
      {#each propertyTypes as { value, label }}
        <option value={value}>{label}</option>
      {/each}
    </select>
  </div>

  <div class="form-group">
    <label class="inline-block w-[5rem]" for="name">Name</label>
    <input
      name="name"
      type="text"
      class="p-1"
      bind:value={newPropertyName}
      placeholder="Enter property name" />
  </div>

  <div class="mt-6 flex gap-3 py-2">
    {#if isEditing}
      <Button
        shape="rect"
        onclick={handleUpdateProperty}
        size="large"
        variant="green">
        <SaveIcon size="16" /> Save
      </Button>
      <Button
        shape="rect"
        variant="rose"
        size="large"
        onclick={handleDeleteProperty}>
        <Trash2Icon size="16" />Delete
      </Button>
    {:else}
      <Button
        shape="rect"
        onclick={handleAddProperty}
        size="large"
        variant="green">
        <SaveIcon size="16" />
        Add
      </Button>
    {/if}
    <Button
      shape="rect"
      size="large"
      variant="bordered"
      onclick={workspace.closePropertyEditor}>
      Cancel
    </Button>
  </div>
</div>
