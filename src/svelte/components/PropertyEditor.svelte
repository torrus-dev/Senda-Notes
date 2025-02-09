<script>
  import { workspace } from "../workspaceController.svelte";
  import { noteController } from "../noteController.svelte";
  import CloseIcon from "../icons/CloseIcon.svelte";
  import TrashIcon from "../icons/TrashIcon.svelte";
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

  // Propiedad en edición (si existe)
  const editingProperty = $derived(workspace.propertyEditor.editingProperty);
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
    const noteId = workspace.propertyEditor.targetNoteId;
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

    // Crear nueva propiedad
    const newProperty = {
      name: newPropertyName.trim(),
      type: newPropertyType,
      value: noteController.getDefaultValue(newPropertyType),
    };

    // Actualizar la nota
    noteController.updateNote(noteId, {
      properties: [...note.properties, newProperty],
    });

    // Limpiar el estado
    newPropertyName = "";
    newPropertyType = "text";

    // Cerrar el editor
    workspace.closePropertyEditor();
  }

  // Manejo de la actualización de una propiedad existente
  function handleUpdateProperty() {
    const noteId = workspace.propertyEditor.targetNoteId;
    if (!noteId || !editingProperty) return;

    const note = noteController.getNoteById(noteId);
    if (!note) return;

    // Validar nombre único
    if (
      newPropertyName.trim() !== workspace.propertyEditor.originalName &&
      note.properties.some((p) => p.name === newPropertyName.trim())
    ) {
      alert("Property name must be unique");
      return;
    }

    // Actualizar la propiedad
    const updatedProperty = {
      ...editingProperty,
      name: newPropertyName.trim(),
      type: newPropertyType,
    };

    const updatedProperties = note.properties.map((p) =>
      p.name === workspace.propertyEditor.originalName ? updatedProperty : p,
    );

    noteController.updateNote(noteId, { properties: updatedProperties });
    workspace.closePropertyEditor();
  }

  // Manejo de la eliminación de una propiedad
  function handleDeleteProperty() {
    const noteId = workspace.propertyEditor.targetNoteId;
    if (!noteId || !editingProperty) return;

    const note = noteController.getNoteById(noteId);
    if (!note) return;

    // Filtrar la propiedad eliminada
    noteController.updateNote(noteId, {
      properties: note.properties.filter(
        (p) => p.name !== workspace.propertyEditor.originalName,
      ),
    });

    // Cerrar el editor
    workspace.closePropertyEditor();
  }
</script>

<div class="property-editor relative p-6 shadow-lg bg-(--color-bg-secondary)">
  <h3 class="text-xl font-bold mb-3">Property Editor</h3>
  <button
    class="absolute top-0 right-0 p-3 clickable-element"
    onclick={workspace.closePropertyEditor}
  >
    <CloseIcon size="large" />
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
      <Button variant="lime" onclick={handleUpdateProperty}>Save</Button>
      <Button variant="rose" onclick={handleDeleteProperty}
        ><TrashIcon size="medium" />Delete</Button
      >
    {:else}
      <Button variant="lime" onclick={handleAddProperty}>Add Property</Button>
    {/if}
    <Button variant="neutral" onclick={workspace.closePropertyEditor}
      >Cancel</Button
    >
  </div>
</div>

<style>
</style>
