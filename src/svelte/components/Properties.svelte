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
        <p>
          <span class="text-blue-400">ID:</span>
          <span class="text-amber-200">{note.id}</span>
        </p>
      </li>

      {#each note.metadata as metadata (metadata.name)}
        <li>
          <p>
            <span class="text-blue-400">{metadata.name}: </span>
            <span class="text-amber-200">{formatDateTime(metadata.value)}</span>
          </p>
        </li>
      {/each}
    </ul>

    <div class="custom-properties">
      <h3 class="text-xl font-bold mt-3">Properties</h3>
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
        <button
          class="p-2 hover:cursor-pointer rounded-md hover:bg-(--color-interactive-hover)"
          onclick={() => workspace.openPropertyEditor(note.id)}
        >
          + Add Property
        </button>
      {/if}
    </div>
  </div>
{/if}

<style>
</style>
