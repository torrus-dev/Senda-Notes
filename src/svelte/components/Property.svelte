<script>
  let {
    property,
    onUpdatePropertyValue,
    handlePropertySelection = null,
    readonly = false,
    isEditable = true,
  } = $props();

  function formatDateTime(fecha) {
    return fecha.slice(0, 16);
  }

  function removeItem(index) {
    if (property.type === "list") {
      const newValue = [...property.value];
      newValue.splice(index, 1);
      onUpdatePropertyValue(property.name, newValue);
    }
  }

  function handleInput(event) {
    if (event.key === "Enter" || event.type === "blur") {
      const inputValue = inputElement.value.trim();
      if (!inputValue) return;

      const newValue = [...property.value, inputValue];
      onUpdatePropertyValue(property.name, newValue);
      inputElement.value = "";
    }
  }

  let inputElement = $state(null);
</script>

<li class="property-item">
  <div
    class="property-label interactive"
    class:interactive={isEditable}
    role="button"
    tabindex="auto"
    onclick={isEditable ? () => handlePropertySelection(property) : null}
  >
    {property.name}
  </div>
  {#if property.type === "text"}
    <input
      name={property.name}
      type="text"
      value={property.value}
      onchange={(event) =>
        onUpdatePropertyValue(property.name, event.target.value)}
    />
  {:else if property.type === "list"}
    <div class="list-input-container">
      <div class="pills-container">
        {#each property.value as item, index}
          <div class="pill">
            <span class="pill-text">{item}</span>
            {#if !readonly}
              <button
                class="remove-button"
                onclick={() => removeItem(index)}
                type="button"
                aria-label="Remove item"
              >
                ×
              </button>
            {/if}
          </div>
        {/each}
      </div>
      {#if !readonly}
        <input
          name={property.name}
          type="text"
          class="list-input"
          placeholder={property.value.length === 0
            ? "Type to add items..."
            : ""}
          onkeydown={handleInput}
          onblur={handleInput}
          bind:this={inputElement}
        />
      {/if}
    </div>
  {:else if property.type === "number"}
    <input
      name={property.name}
      type="number"
      value={property.value}
      onchange={(event) => {
        const value = Number(event.target.value);
        if (!isNaN(value)) {
          onUpdatePropertyValue(property.name, value);
        }
      }}
      disabled={readonly}
    />
  {:else if property.type === "check"}
    <input
      name={property.name}
      type="checkbox"
      checked={property.value}
      onchange={(e) => onUpdatePropertyValue(property.name, e.target.checked)}
      disabled={readonly}
    />
  {:else if property.type === "date"}
    <input
      name={property.name}
      type="date"
      value={property.value instanceof Date
        ? property.value.toISOString().split("T")[0]
        : property.value}
      onchange={(e) =>
        onUpdatePropertyValue(property.name, new Date(e.target.value))}
      disabled={readonly}
    />
  {:else if property.type === "datetime"}
    <input
      name={property.name}
      type="datetime-local"
      value={property.value instanceof Date
        ? formatDateTime(property.value.toISOString())
        : formatDateTime(property.value)}
      onchange={(e) =>
        onUpdatePropertyValue(property.name, new Date(e.target.value))}
      disabled={readonly}
    />
  {/if}
</li>

<style>
  .property-item {
    display: flex;
  }
  .property-label.interactive {
    width: 6rem;
    &.interactive:hover {
      cursor: pointer;
      background-color: aliceblue;
    }
  }
  .list-input-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    min-height: 32px;
    padding: 4px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .pills-container {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    background-color: #e9ecef;
    border-radius: 16px;
    padding: 4px 12px;
    font-size: 14px;
  }

  .pill-text {
    margin-right: 4px;
  }

  .remove-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: none;
    background: none;
    color: #666;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    border-radius: 50%;
    line-height: 1;
  }

  .remove-button:hover {
    background-color: rgba(0, 0, 0, 0.1);
    color: #333;
  }

  .list-input {
    flex: 1;
    min-width: 50px;
    border: none;
    outline: none;
    font-size: 14px;
    padding: 4px;
  }

  .list-input::placeholder {
    color: #999;
  }
</style>
