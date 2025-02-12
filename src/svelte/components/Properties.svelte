<script>
  import Property from "./Property.svelte";
  import PropertyEditor from "./PropertyEditor.svelte";
  import { workspace } from "../workspaceController.svelte";
  import { noteController } from "../noteController.svelte";
  import { formatDateTime } from "../utils.svelte";
  import { PlusIcon } from "lucide-svelte";

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
</script>

{#if note}
  <div class="properties-container">
    <div class="my-6">
      <ul>
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
              <span class="text-amber-200"
                >{formatDateTime(metadata.value)}</span
              >
            </p>
          </li>
        {/each}
      </ul>
    </div>

    <div class="custom-properties my-6">
      <h3 class="text-xl font-bold py-1">Properties</h3>
      <ul class="property-box">
        {#each note.properties as property}
          <li>
            <Property
              noteId={note.id}
              {property}
              onUpdate={handlePropertyUpdate}
            />
          </li>
        {/each}
      </ul>

      {#if workspace.state.propertyEditor.isVisible && workspace.state.propertyEditor.targetNoteId === note.id}
        <PropertyEditor />
      {:else}
        <button
          class="btn btn-neutral"
          onclick={() => workspace.openPropertyEditor(note.id)}
        >
          <PlusIcon size="18" /> Add Property
        </button>
      {/if}
    </div>
  </div>
{/if}

<style>
</style>
