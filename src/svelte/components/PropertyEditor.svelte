<script>
  import { workspace } from "../workspaceController.svelte";
  import { noteController } from "../noteController.svelte";
  import Property from "./Property.svelte";

  const options = [
    { value: "text", label: "Text" },
    { value: "list", label: "List" },
    { value: "number", label: "Number" },
    { value: "check", label: "Check" },
    { value: "date", label: "Date" },
    { value: "datetime", label: "Datetime" },
  ];

  let newPropertyName = "";
  let newPropertyType = "text";

  // Esta función pasarla a noteController para que quede mas ordenado
  function getDefaultValue(type) {
    switch (type) {
      case "text":
        return "";
      case "list":
        return [];
      case "number":
        return 0;
      case "check":
        return false;
      case "date":
        return new Date().toISOString().split("T")[0];
      case "datetime":
        return new Date().toISOString();
      default:
        return "";
    }
  }

  function handleAdd() {
    const noteId = workspace.propertyEditor.targetNoteId;
    if (!noteId) return;

    const note = noteController.getNoteById(noteId);
    if (!note) return;

    if (!newPropertyName.trim()) {
      alert("Property name is required");
      return;
    }

    if (note.properties.some((p) => p.name === newPropertyName.trim())) {
      alert("Property name must be unique");
      return;
    }

    const newProperty = {
      name: newPropertyName.trim(),
      type: newPropertyType,
      value: getDefaultValue(newPropertyType),
    };

    noteController.updateNote(noteId, {
      properties: [...note.properties, newProperty],
    });

    workspace.closePropertyEditor();
  }

  function handleSave() {
    const noteId = workspace.propertyEditor.targetNoteId;
    if (!noteId) return;

    const editedProp = workspace.propertyEditor.editingProperty;
    const originalName = workspace.propertyEditor.originalName;
    if (!editedProp || !originalName) return;

    const note = noteController.getNoteById(noteId);
    if (!note) return;

    if (!editedProp.name.trim()) {
      alert("Property name is required");
      return;
    }

    if (
      editedProp.name !== originalName &&
      note.properties.some((p) => p.name === editedProp.name)
    ) {
      alert("Property name must be unique");
      return;
    }

    const updatedProps = note.properties.map((p) =>
      p.name === originalName ? { ...editedProp } : p,
    );

    noteController.updateNote(noteId, { properties: updatedProps });
    workspace.closePropertyEditor();
  }

  function handleDelete() {
    const noteId = workspace.propertyEditor.targetNoteId;
    const originalName = workspace.propertyEditor.originalName;
    if (!noteId || !originalName) return;

    const note = noteController.getNoteById(noteId);
    if (!note) return;

    noteController.updateNote(noteId, {
      properties: note.properties.filter((p) => p.name !== originalName),
    });
    workspace.closePropertyEditor();
  }
</script>

<div class="property-editor">
  <button class="close-btn" on:click={workspace.closePropertyEditor}>×</button>

  <div class="form-group">
    <label for="type">Property Type</label>
    {#if workspace.propertyEditor.editingProperty}
      <select
        name="type"
        bind:value={workspace.propertyEditor.editingProperty.type}
      >
        {#each options as { value, label }}
          <option {value}>{label}</option>
        {/each}
      </select>
    {:else}
      <select name="type" bind:value={newPropertyType}>
        {#each options as { value, label }}
          <option {value}>{label}</option>
        {/each}
      </select>
    {/if}
  </div>

  <div class="form-group">
    <label for="name">Property Name</label>
    {#if workspace.propertyEditor.editingProperty}
      <input
        name="name"
        type="text"
        bind:value={workspace.propertyEditor.editingProperty.name}
        placeholder="Enter property name"
      />
    {:else}
      <input
        name="name"
        type="text"
        bind:value={newPropertyName}
        placeholder="Enter property name"
      />
    {/if}
  </div>

  {#if workspace.propertyEditor.editingProperty}
    <div class="preview">
      <h4>Preview</h4>
      <Property property={workspace.propertyEditor.editingProperty} readonly />
    </div>
  {/if}

  <div class="actions">
    {#if workspace.propertyEditor.editingProperty}
      <button class="save-btn" on:click={handleSave}>Save Changes</button>
      <button class="delete-btn" on:click={handleDelete}>Delete Property</button
      >
    {:else}
      <button class="add-btn" on:click={handleAdd}>Add Property</button>
    {/if}
    <button class="cancel-btn" on:click={workspace.closePropertyEditor}
      >Cancel</button
    >
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

  .preview {
    margin: 1rem 0;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 4px;
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
