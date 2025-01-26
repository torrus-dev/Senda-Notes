<script>
  import { noteController } from "../noteController.svelte";
  import { workspace } from "../workspaceController.svelte";
  import PropertyEditor from "./PropertyEditor.svelte";
  import Property from "./Property.svelte";

  let { noteId = null } = $props();
  let note = $derived(noteController.getNoteById(noteId));

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
  function handlePropertySelection(property) {
    // TODO: implementar editar y guardar
    if (workspace.propertyEditor.editingProperty === property) {
      workspace.closePropertyEditor();
    } else {
      workspace.openPropertyEditor(noteId, property);
    }
  }
</script>

{#if noteId}
  <ul class="property-box">
    {#each note.metadata as metatadata (metatadata.name)}
      <li>
        <p>{metatadata.name}: {metatadata.value}</p>
      </li>
    {/each}
  </ul>

  <ul class="property-box">
    {#each note.properties as property (property.name)}
      <Property {property} {handlePropertySelection} {onUpdatePropertyValue}
      ></Property>
    {/each}
  </ul>
  {#if workspace.propertyEditor.isVisible}
    <PropertyEditor></PropertyEditor>
  {:else}
    <button onclick={() => workspace.openPropertyEditor(noteId)}
      >+ Añadir propiedad</button
    >
  {/if}
{/if}

<style>
  .property-box {
    margin: 2em 0;
    padding: 0;
    list-style: none;
  }
</style>
