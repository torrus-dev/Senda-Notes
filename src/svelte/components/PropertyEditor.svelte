<script>
  import { workspace } from "../workspaceController.svelte";
  import { noteController } from "../noteController.svelte";
  import { XIcon, Trash2Icon } from "lucide-svelte";
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

<div class="property-editor relative p-6 shadow-lg bg-(--color-bg-secondary)">
  <h3 class="text-xl font-bold mb-3">Property Editor</h3>
  <button
    class="absolute top-0 right-0 p-3 clickable-element"
    onclick={workspace.closePropertyEditor}
  >
    <XIcon />
  </button>

  <div class="py-2">
    <label for="type" class="w-[5rem] inline-block">Type</label>
    <select class="p-1" name="type" bind:value={newPropertyType}>
      {#each propertyTypes as { value, label }}
        <option {value}>{label}</option>
      {/each}
    </select>
  </div>

  <div class="form-group">
    <label class="w-[5rem] inline-block" for="name">Name</label>
    <input
      name="name"
      type="text"
      class="p-1"
      bind:value={newPropertyName}
      placeholder="Enter property name"
    />
  </div>

  <div class="mt-6 py-2 flex gap-3">
    {#if isEditing}
      <button class="btn btn-success" onclick={handleUpdateProperty}
        >Save</button
      >
      <button class="btn btn-delete" onclick={handleDeleteProperty}
        ><Trash2Icon size="18" />Delete</button
      >
    {:else}
      <button class="btn btn-success" onclick={handleAddProperty}>
        Add Property
      </button>
    {/if}
    <button class="btn btn-neutral" onclick={workspace.closePropertyEditor}
      >Cancel</button
    >
  </div>
</div>

<style>
</style>
