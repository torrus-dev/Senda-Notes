<script>
  import { formatDateTimeForInput } from "../utils.svelte";
  import { workspace } from "../workspaceController.svelte";
  import { noteController } from "../noteController.svelte";

  // Importar iconos
  import TextIcon from "../icons/TextIcon.svelte";
  import ListIcon from "../icons/ListIcon.svelte";
  import NumberIcon from "../icons/NumberIcon.svelte";
  import CheckIcon from "../icons/CheckIcon.svelte";
  import DateIcon from "../icons/DateIcon.svelte";
  import DatetimeIcon from "../icons/DatetimeIcon.svelte";
  import CloseIcon from "../icons/CloseIcon.svelte";
  import AdjustIcon from "../icons/AdjustIcon.svelte";
  import TrashIcon from "../icons/TrashIcon.svelte";

  // Props en runes mode
  let { noteId = null, property = null, onUpdate, readonly = false } = $props();
  let showOptions = $state(false);

  // Estado de referencia para el input (en caso de list)
  let inputElement = $state(null);

  // Función para eliminar un elemento de la lista
  function removeListItem(index) {
    if (property.type === "list") {
      const newValue = [...property.value];
      newValue.splice(index, 1);
      onUpdate(property.name, newValue);
    }
  }

  // Manejo de entrada en lista
  function handleListInput(event) {
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

  // Seleccionar el icono según el tipo de propiedad
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

  // Obtener el componente de icono actual (derivado)
  const IconComponent = $derived(getIconComponent(property.type));

  // Action para detectar clicks fuera del nodo
  function clickOutside(node) {
    const handleClick = (event) => {
      if (!node.contains(event.target)) {
        node.dispatchEvent(new CustomEvent("outclick"));
      }
    };
    document.addEventListener("click", handleClick, true);
    return {
      destroy() {
        document.removeEventListener("click", handleClick, true);
      },
    };
  }

  // Función para alternar la visualización del menú de opciones
  function toggleOptions() {
    showOptions = !showOptions;
  }

  // Handler que cierra el menú al hacer click fuera
  function handleOutClick() {
    showOptions = false;
  }
</script>

<li class="property-item flex gap-2 ml-[-0.5rem] relative">
  <!-- Contenedor para el label y el menú -->
  <div class="relative inline-block">
    <button
      class="clickable-element rounded text-left flex items-center gap-2 p-2 w-(--property-label-width)"
      onclick={toggleOptions}
    >
      {#if IconComponent}
        <span class="property-icon"><IconComponent /></span>
      {/if}
      <p class="w-(--property-label-width)">
        {property.name}
      </p>
    </button>

    {#if showOptions}
      <!-- Menú flotante con acción clickOutside para cerrarse -->
      <div
        class="absolute z-10 mt-1 p-2 bg-(--color-bg-secondary) rounded shadow border-1 border-(--color-border-normal)"
        use:clickOutside
        onoutclick={handleOutClick}
      >
        <ul>
          <li>
            <button
              class="clickable-element flex items-center whitespace-nowrap gap-1 p-2 w-full text-left rounded"
              onclick={() => {
                workspace.openPropertyEditor(noteId, property);
                showOptions = false;
              }}
            >
              <AdjustIcon class="w-4 h-4" />
              <p class="whitespace-nowrap">Edit Property</p>
            </button>
          </li>
          <li>
            <button
              class="clickable-element flex items-center gap-1 p-2 w-full text-left rounded text-rose-400"
              onclick={() => {
                noteController.deleteProperty(noteId, property.id);
                showOptions = false;
              }}
            >
              <TrashIcon class="w-4 h-4" />
              <p class="whitespace-nowrap">Delete Property</p>
            </button>
          </li>
        </ul>
      </div>
    {/if}
  </div>

  <!-- Renderizado condicional de la propiedad según su tipo -->
  {#if property.type === "text"}
    <input
      name={property.name}
      type="text"
      value={property.value}
      onchange={(event) => onUpdate(property.name, event.target.value)}
      placeholder="No value"
      class="grow-1"
    />
  {:else if property.type === "list"}
    <div class="inline-flex gap-1 grow-1 flex-wrap border-2 border-amber-50">
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
    border-radius: calc(var(--spacing) * 2);
  }
</style>
