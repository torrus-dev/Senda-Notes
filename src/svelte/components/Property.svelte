<script>
  import { formatDateTimeForInput } from "../utils.svelte";
  import { workspace } from "../workspaceController.svelte";
  import { noteController } from "../noteController.svelte";
  import DropdownList from "./DropdownList.svelte";

  import {
    TextIcon,
    ListIcon,
    HashIcon,
    CheckSquareIcon,
    CalendarIcon,
    CalendarClockIcon,
    XIcon,
    SlidersHorizontalIcon,
    Trash2Icon,
  } from "lucide-svelte";

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
        return HashIcon;
      case "check":
        return CheckSquareIcon;
      case "date":
        return CalendarIcon;
      case "datetime":
        return CalendarClockIcon;
      default:
        return null;
    }
  }

  // Obtener el componente de icono actual (derivado)
  const IconComponent = $derived(getIconComponent(property.type));
</script>

<li class="property-item flex gap-2 ml-[-0.5rem] relative">
  <DropdownList position="center">
    {#snippet label()}
      {#if IconComponent}
        <span class="property-icon"><IconComponent size="18" /></span>
      {/if}
      <p class="text-left w-(--property-label-width)">
        {property.name}
      </p>
    {/snippet}
    {#snippet menuList()}
      <li>
        <button
          onclick={() => {
            workspace.openPropertyEditor(noteId, property);
            showOptions = false;
          }}
        >
          <SlidersHorizontalIcon size="18" />Edit Property
        </button>
      </li>
      <li>
        <button
          class="text-rose-500"
          onclick={() => {
            noteController.deleteProperty(noteId, property.id);
            showOptions = false;
          }}
        >
          <Trash2Icon size="18" />Delete Property
        </button>
      </li>
    {/snippet}
  </DropdownList>

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
        <div class="badge badge-neutral">
          <span>{item}</span>
          {#if !readonly}
            <button
              class="clickable mr-[-0.25rem] text-(--color-font-faint)"
              onclick={() => removeListItem(index)}
              aria-label="Remove item"
            >
              <XIcon size="18" />
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
</style>
