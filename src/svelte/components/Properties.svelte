<script>
  import { noteController } from "../noteController.svelte";
  import { workspace } from "../workspaceController.svelte";
  import Property from "./Property.svelte";
  import PropertyEditor from "./PropertyEditor.svelte";

  let { noteId = null } = $props();
  let note = $derived(noteController.getNoteById(noteId || ""));

  function onUpdatePropertyValue(propertyName, newValue) {
    if (!noteId || !note) return;

    const updatedProperties = note.properties.map((property) =>
      property.name === propertyName
        ? { ...property, value: newValue }
        : property,
    );

    noteController.updateNote(noteId, { properties: updatedProperties });
  }

  function handlePropertySelection(property) {
    if (!noteId) return;

    workspace.propertyEditor.isVisible
      ? workspace.closePropertyEditor()
      : workspace.openPropertyEditor(noteId, property);
  }
</script>

{#if noteId && note}
  <div class="properties-container">
    <div class="properties-container">
      <div class="metadata-section">
        <h3>Metadata</h3>
        <ul class="property-box">
          {#each note.metadata as metadata (metadata.name)}
            <li>
              <p>{metadata.name}: {metadata.value}</p>
            </li>
          {/each}
        </ul>
      </div>

      <div class="custom-properties">
        <h3>Custom Properties</h3>
        <ul class="property-box">
          {#each note.properties as property (property.name)}
            <Property
              {property}
              {handlePropertySelection}
              {onUpdatePropertyValue}
            />
          {/each}
        </ul>

        {#if workspace.propertyEditor.isVisible && workspace.propertyEditor.targetNoteId === noteId}
          <PropertyEditor />
        {:else}
          <button onclick={() => workspace.openPropertyEditor(noteId)}>
            + Add Property
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .properties-container {
    padding: 1rem;
    border: 1px solid #eee;
    margin: 1rem 0;
  }

  .property-box {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0;
  }

  .metadata-section,
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
  .property-box {
    margin: 2em 0;
    padding: 0;
    list-style: none;
  }
</style>
