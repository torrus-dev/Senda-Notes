<script>
  import { workspace } from "../workspaceController.svelte";
  import Property from "./Property.svelte";

  const options = [
    { value: "text", label: "Text" },
    { value: "list", label: "List" },
    { value: "number", label: "Number" },
    { value: "check", label: "Check" },
    { value: "date", label: "Date" },
    { value: "datetime", label: "Datetime" },
  ];
</script>

<div class="property-dialog">
  <button onclick={() => workspace.closePropertyEditor()} class="close-btn"
    >X</button
  >
  <label for="property-type">Tipo de propiedad</label>
  <div>
    {#if workspace.propertyEditor.editingProperty !== null}
      <select
        name="type"
        bind:value={workspace.propertyEditor.editingProperty.type}
        required
      >
        {#each options as { value, label }}
          <option {value}>{label}</option>
        {/each}
      </select>
    {:else}
      <select name="type" required>
        {#each options as { value, label }}
          <option {value}>{label}</option>
        {/each}
      </select>
    {/if}
  </div>
  <div>
    <label for="property-type">Nombre</label>
    {#if workspace.propertyEditor.editingProperty !== null}
      <input
        name="name"
        type="text"
        bind:value={workspace.propertyEditor.editingProperty.name}
      />
    {:else}
      <input name="name" type="text" />
    {/if}
  </div>
  {#if workspace.propertyEditor.editingProperty !== null}
    <div>
      <p>Resultado</p>
      <Property
        property={workspace.propertyEditor.editingProperty}
        readonly={true}
        isEditable={false}
      ></Property>
    </div>
  {/if}

  {#if workspace.propertyEditor.editingProperty !== null}
    <button>Guardar</button>
    <button>Eliminar</button>
    <button onclick={() => workspace.closePropertyEditor()}>Cancelar</button>
  {:else}
    <button>Añadir</button>
    <button onclick={() => workspace.closePropertyEditor()}>Cancelar</button>
  {/if}
</div>

<style>
  .property-dialog {
    padding: 1em 0.5em;
    border: 1px solid black;
    position: relative;
    .close-btn {
      position: absolute;
      right: 0;
      top: 0;
      padding: 0.5em;
    }
  }
</style>
