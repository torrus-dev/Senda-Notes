<script>
  import { noteController } from "../noteController.svelte";
  import { workspaceState } from "../workspaceState.svelte";
  import Property from "./Property.svelte";

  let { noteId = null } = $props();
  let note = $derived(noteController.getNoteById(noteId));

  let { isVisible, targetNoteId, editingProperty } = $derived(
    workspaceState.propertyEditor,
  );

  function onUpdatePropertyValue(propertyName, newValue) {
    const updatedProperties = note.properties.map((property) => {
      if (property.name === propertyName) {
        return { ...property, value: newValue };
      }
      return property;
    });

    noteController.updateNote(noteId, {
      properties: updatedProperties,
    });
  }
  function toggleEditPropertyDialog(property) {
    if (workspaceState && !workspaceState.propertyEditor.isVisible) {
      workspaceState.propertyEditor.editingProperty = property;
      workspaceState.propertyEditor.targetNoteId = noteId;
      workspaceState.propertyEditor.isVisible = true;
    } else {
      workspaceState.propertyEditor.editingProperty = null;
      workspaceState.propertyEditor.targetNoteId = null;
      workspaceState.propertyEditor.isVisible = false;
    }
  }
</script>

{#if noteId}
  <ul class="property-box">
    {#each note.properties as property (property.name)}
      <Property {property} {toggleEditPropertyDialog} {onUpdatePropertyValue}
      ></Property>
    {/each}
  </ul>
  {#if workspaceState.propertyEditor.isVisible}
    <div class="property-dialog">
      <button>Close</button>
      <label for="property-type">Tipo de propiedad</label>
      <div>
        <select required>
          <option
            value="text"
            selected={workspaceState.propertyEditor.editingProperty.type ===
              "text"}>Text</option
          >
          <option
            value="list"
            selected={workspaceState.propertyEditor.editingProperty.type ===
              "list"}>List</option
          >
          <option
            value="number"
            selected={workspaceState.propertyEditor.editingProperty.type ===
              "number"}>Number</option
          >
          <option
            value="check"
            selected={workspaceState.propertyEditor.editingProperty.type ===
              "check"}>Check</option
          >
          <option
            value="date"
            selected={workspaceState.propertyEditor.editingProperty.type ===
              "date"}>Date</option
          >
          <option
            value="datetime"
            selected={workspaceState.propertyEditor.editingProperty.type ===
              "datetime"}>Datetime</option
          >
        </select>
      </div>
      <div>
        <label for="property-type">Nombre</label>
        <input
          type="text"
          bind:value={workspaceState.propertyEditor.editingProperty.name}
        />
      </div>
      <div>
        <p>Resultado</p>
        <Property
          property={workspaceState.propertyEditor.editingProperty}
          readonly={true}
          isEditable={false}
        ></Property>
      </div>
      <button>Guardar</button>
      <button>Eliminar</button>
    </div>
  {/if}
{/if}

<style>
  .property-box {
    margin: 2em 0;
    padding: 0;
    list-style: none;
  }
  .property-dialog {
    padding: 1em 0.5em;
    border: 1px solid black;
  }
</style>
