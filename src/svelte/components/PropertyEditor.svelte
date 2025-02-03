<script>
  import { workspace } from "../workspaceController.svelte";
  import { noteController } from "../noteController.svelte";

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

<div class="property-editor">
  <button class="close-btn" onclick={workspace.closePropertyEditor}>×</button>

  <div class="form-group">
    <label for="type">Property Type</label>
    <select name="type" bind:value={newPropertyType}>
      {#each propertyTypes as { value, label }}
        <option {value}>{label}</option>
      {/each}
    </select>
  </div>

  <div class="form-group">
    <label for="name">Property Name</label>
    <input
      name="name"
      type="text"
      bind:value={newPropertyName}
      placeholder="Enter property name"
    />
  </div>

  <div class="actions">
    {#if isEditing}
      <button class="save-btn" onclick={handleUpdateProperty}
        >Save Changes
      </button>
      <button class="delete-btn" onclick={handleDeleteProperty}
        >Delete Property
      </button>
    {:else}
      <button class="add-btn" onclick={handleAddProperty}>Add Property</button>
    {/if}
    <button class="cancel-btn" onclick={workspace.closePropertyEditor}
      >Cancel
    </button>
  </div>
</div>

<style>
  .property-editor {
    position: relative;
    padding: 1.5rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-top: 1rem;
  }

  .close-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #666;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  select,
  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  button:hover {
    opacity: 0.9;
  }

  .add-btn,
  .save-btn {
    background-color: #4caf50;
    color: white;
  }

  .delete-btn {
    background-color: #f44336;
    color: white;
  }

  .cancel-btn {
    background-color: #666;
    color: white;
  }
</style>
