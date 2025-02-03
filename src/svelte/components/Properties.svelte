<script>
  import Property from "./Property.svelte";
  import PropertyEditor from "./PropertyEditor.svelte";
  import { workspace } from "../workspaceController.svelte";
  import { noteController } from "../noteController.svelte";
  import { formatDateTime } from "../utils.svelte";

  let { note } = $props();

  function handlePropertyUpdate(propertyName, newValue) {
    if (!note) return;

    const updatedProperties = note.properties.map((property) =>
      property.name === propertyName
        ? { ...property, value: newValue }
        : property,
    );

    noteController.updateNote(note.id, { properties: updatedProperties });
  }

  function openPropertyEditor(property = null) {
    workspace.openPropertyEditor(note.id, property);
  }
</script>

{#if note}
  <div class="properties-container">
    <ul class="property-box">
      <li>
        <p>ID: {note.id}</p>
      </li>
      {#each note.metadata as metadata (metadata.name)}
        <li>
          <p>{metadata.name}: {formatDateTime(metadata.value)}</p>
        </li>
      {/each}
    </ul>

    <div class="custom-properties">
      <h3>Properties</h3>
      <ul class="property-box">
        {#each note.properties as property}
          <li>
            <Property
              {property}
              onUpdate={handlePropertyUpdate}
              onEdit={() => openPropertyEditor(property)}
            />
          </li>
        {/each}
      </ul>

      {#if workspace.propertyEditor.isVisible && workspace.propertyEditor.targetNoteId === note.id}
        <PropertyEditor />
      {:else}
        <button onclick={() => workspace.openPropertyEditor(note.id)}>
          + Add Property
        </button>
      {/if}
    </div>
  </div>
{/if}

<style>
  .properties-container {
    border: 1px solid #eee;
  }

  .property-box {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0;
  }

  .custom-properties {
    margin-bottom: 1.5rem;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    color: #333;
  }

  button {
    padding: 0.5rem 1rem;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: #45a049;
  }
</style>
