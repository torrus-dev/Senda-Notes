<script>
  import { formatDateTimeForInput } from "../utils.svelte";

  // Importar los iconos
  import TextIcon from "../icons/TextIcon.svelte";
  import ListIcon from "../icons/ListIcon.svelte";
  import NumberIcon from "../icons/NumberIcon.svelte";
  import CheckIcon from "../icons/CheckIcon.svelte";
  import DateIcon from "../icons/DateIcon.svelte";
  import DatetimeIcon from "../icons/DatetimeIcon.svelte";

  let { property, onUpdate, onEdit = null, readonly = false } = $props();

  function removeItem(index) {
    if (property.type === "list") {
      const newValue = [...property.value];
      newValue.splice(index, 1);
      onUpdate(property.name, newValue);
    }
  }

  function handleInput(event) {
    if (event.key === "Enter" || event.type === "blur") {
      const inputValue = inputElement.value.trim();
      if (!inputValue) return;

      const newValue = [...property.value, inputValue];
      onUpdate(property.name, newValue);
      inputElement.value = "";
    }
  }

  // Obtener el componente de icono según el tipo de propiedad
  function getIconComponent(type) {
    switch (type) {
      case "text":
        return TextIcon;
      case "list":
        return ListIcon;
      case "number":
        return NumberIcon;
      case "check":
        return CheckIcon;
      case "date":
        return DateIcon;
      case "datetime":
        return DatetimeIcon;
      default:
        return null;
    }
  }

  // Obtener el componente de icono actual
  const IconComponent = $derived(getIconComponent(property.type));

  let inputElement = $state(null);
</script>

<li class="property-item">
  <button
    class="property-label"
    tabindex="auto"
    onclick={() => onEdit(property)}
  >
    {#if IconComponent}
      <span class="property-icon"> <IconComponent /> </span>
    {/if}
    {property.name}
  </button>
  {#if property.type === "text"}
    <input
      name={property.name}
      type="text"
      value={property.value}
      onchange={(event) => onUpdate(property.name, event.target.value)}
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
          onUpdate(property.name, value);
        }
      }}
      disabled={readonly}
    />
  {:else if property.type === "check"}
    <input
      name={property.name}
      type="checkbox"
      checked={property.value}
      onchange={(e) => onUpdate(property.name, e.target.checked)}
      disabled={readonly}
    />
  {:else if property.type === "date"}
    <input
      name={property.name}
      type="date"
      value={property.value instanceof Date
        ? property.value.toISOString().split("T")[0]
        : property.value}
      onchange={(e) => onUpdate(property.name, new Date(e.target.value))}
      disabled={readonly}
    />
  {:else if property.type === "datetime"}
    <input
      name={property.name}
      type="datetime-local"
      value={property.value instanceof Date
        ? formatDateTimeForInput(property.value.toISOString())
        : formatDateTimeForInput(property.value)}
      onchange={(e) => onUpdate(property.name, new Date(e.target.value))}
      disabled={readonly}
    />
  {/if}
</li>

<style>
  .property-item {
    display: flex;
  }
  .property-label {
    width: 8rem;
    text-align: left;
    &:hover {
      cursor: pointer;
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
