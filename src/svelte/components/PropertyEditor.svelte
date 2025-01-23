<script>
  export let property;
  export let onUpdate;
  export let onDelete;
</script>

<div class="property-editor">
  <div class="property-header">
    <span class="property-name">{property.name}</span>
    <button
      class="delete-button"
      onclick={onDelete}
      aria-label="Eliminar propiedad"
    >
      ✖
    </button>
  </div>

  <div class="property-input-container">
    {#if property.type === "text"}
      <input
        type="text"
        value={property.value}
        oninput={(e) => onUpdate({ ...property, value: e.target.value })}
      />
    {:else if property.type === "list"}
      <div class="list-input">
        {#each property.value as item, index}
          <div class="list-item">
            <input
              type="text"
              value={item}
              oninput={(e) => {
                const newList = [...property.value];
                newList[index] = e.target.value;
                onUpdate({ ...property, value: newList });
              }}
            />
            <button
              onclick={() => {
                const newList = property.value.filter((_, i) => i !== index);
                onUpdate({ ...property, value: newList });
              }}
            >
              ✖
            </button>
          </div>
        {/each}
        <button
          onclick={() => {
            const newList = [...property.value, ""];
            onUpdate({ ...property, value: newList });
          }}
        >
          Añadir elemento
        </button>
      </div>
    {:else if property.type === "number"}
      <input
        type="number"
        value={property.value}
        oninput={(e) =>
          onUpdate({ ...property, value: Number(e.target.value) })}
      />
    {:else if property.type === "check"}
      <input
        type="checkbox"
        checked={property.value}
        onchange={(e) => onUpdate({ ...property, value: e.target.checked })}
      />
    {:else if property.type === "date"}
      <input
        type="date"
        value={property.value instanceof Date
          ? property.value.toISOString().split("T")[0]
          : property.value}
        oninput={(e) =>
          onUpdate({ ...property, value: new Date(e.target.value) })}
      />
    {:else if property.type === "datetime"}
      <input
        type="datetime-local"
        value={property.value instanceof Date
          ? property.value.toISOString().slice(0, 16)
          : property.value}
        oninput={(e) =>
          onUpdate({ ...property, value: new Date(e.target.value) })}
      />
    {/if}
  </div>
</div>

<style>
  .property-editor {
    border: 1px solid #ddd;
    margin-bottom: 10px;
    padding: 10px;
  }

  .property-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .property-name {
    font-weight: bold;
  }

  .delete-button {
    background-color: #ff4444;
    color: white;
    border: none;
    padding: 5px;
    cursor: pointer;
  }

  .list-input .list-item {
    display: flex;
    margin-bottom: 5px;
  }

  .list-input button {
    margin-left: 5px;
  }
</style>
