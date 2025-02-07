<script>
  import { formatDateTimeForInput } from "../utils.svelte";

  // Importar los iconos
  import TextIcon from "../icons/TextIcon.svelte";
  import ListIcon from "../icons/ListIcon.svelte";
  import NumberIcon from "../icons/NumberIcon.svelte";
  import CheckIcon from "../icons/CheckIcon.svelte";
  import DateIcon from "../icons/DateIcon.svelte";
  import DatetimeIcon from "../icons/DatetimeIcon.svelte";
  import CloseIcon from "../icons/CloseIcon.svelte";

  let { property, onUpdate, onEdit = null, readonly = false } = $props();

  function removeListItem(index) {
    if (property.type === "list") {
      const newValue = [...property.value];
      newValue.splice(index, 1);
      onUpdate(property.name, newValue);
    }
  }

  function handleListInput(event) {
    console.log(event.key);
    if (event.key === "Enter" || event.type === "blur") {
      const inputValue = inputElement.value.trim();
      if (!inputValue) return;

      const newValue = [...property.value, inputValue];
      onUpdate(property.name, newValue);
      inputElement.value = "";
    }
    if (event.key === "Backspace" || event.key === "Delete") {
      let lastListItem = property.value.length - 1;
      removeListItem(lastListItem);
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

<li class="property-item flex">
  <button
    class="property-label clickable-element flex gap-2 py-1.5 w-(--property-label-width)"
    onclick={() => onEdit(property)}
  >
    {#if IconComponent}
      <span class="property-icon"> <IconComponent /> </span>
    {/if}
    <p class="w-(--property-label-width)">
      {property.name}
    </p>
  </button>

  <!-- condicional para tipos -->
  {#if property.type === "text"}
    <input
      name={property.name}
      type="text"
      value={property.value}
      onchange={(event) => onUpdate(property.name, event.target.value)}
    />
  {:else if property.type === "list"}
    <div class="inline-flex gap-1 flex-wrap border-amber-50 border-2">
      {#each property.value as item, index}
        <div
          class="flex rounded-sm py-1 px-2 items-center bg-(--color-bg-secondary) gap-0.5"
        >
          <span>{item}</span>

          {#if !readonly}
            <button
              class="clickable-element mr-[-0.25rem] text-(--color-font-faint)"
              onclick={() => removeListItem(index)}
              aria-label="Remove item"
            >
              <CloseIcon size="small" />
            </button>
          {/if}
        </div>
      {/each}

      {#if !readonly}
        <input
          name={property.name}
          type="text"
          class="flex"
          placeholder={property.value.length === 0
            ? "Type to add items..."
            : ""}
          onkeydown={handleListInput}
          onblur={handleListInput}
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
    width: 100%;
    flex-grow: 2;
  }
  .property-label {
    background: none;
    color: inherit;
    border: none;
    width: var(--width-metadata-label);
    text-align: left;
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
</style>
