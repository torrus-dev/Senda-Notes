<style>
</style>

<script>
import { formatDateTimeForInput } from "../../controllers/utils.svelte";
import { workspace } from "../../controllers/workspaceController.svelte";
import { dndController } from "../../controllers/dndController.svelte";
import { propertyController } from "../../controllers/propertyController.svelte";
import DropdownList from "../DropdownList.svelte";

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
import Button from "../Button.svelte";

let {
  noteId = null,
  position,
  property = null,
  onUpdate,
  readonly = false,
} = $props();
let isDragedOver = $state(false);
// Obtener el componente de icono actual (derivado)
const IconComponent = $derived(getIconComponent(property.type));

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

// drag
const handleDragStart = (event) => {
  event.stopPropagation();
  dndController.setDragSource({
    type: "property",
    data: {
      noteId: noteId,
      propertyId: property.id,
    },
  });
  event.dataTransfer.effectAllowed = "move";
};

const handleDragEnd = (event) => {
  dndController.clearDragAndDrop();
};

// drop
const handleDragOver = (event) => {
  event.preventDefault();
  event.stopPropagation();
  isDragedOver = true;
};

const handleDragLeave = (event) => {
  event.preventDefault();
  isDragedOver = false;
};

const handleDrop = (event) => {
  event.preventDefault();
  event.stopPropagation();
  isDragedOver = false;

  dndController.setDropTarget({
    type: "property-line",
    data: {
      position: position,
    },
  });
  dndController.handleDrop();
};
</script>

<li
  class="bg-transaprent rounded-field relative ml-[-0.5rem] grid grid-cols-[12rem_auto] gap-2 transition-colors duration-300 {isDragedOver
    ? 'highlight'
    : ''}"
  draggable="true"
  ondragstart={handleDragStart}
  ondragend={handleDragEnd}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}>
  <DropdownList
    position="start"
    menuItems={[
      {
        label: "Edit Property",
        icon: SlidersHorizontalIcon,
        onClick: () => {
          workspace.openPropertyEditor(noteId, property);
          // close
        },
      },
      {
        label: "Delete Property",
        icon: Trash2Icon,
        onClick: () => {
          propertyController.deleteProperty(noteId, property.id);
          // close
        },
        class: "text-error",
      },
    ]}>
    {#snippet label()}
      {#if IconComponent}
        <span class="property-icon"><IconComponent size="18" /></span>
      {/if}
      <p class="w-[9rem] overflow-clip text-left">
        {property.name}
      </p>
    {/snippet}
  </DropdownList>

  <!-- Renderizado condicional de la propiedad según su tipo -->
  {#if property.type === "text"}
    <input
      name={property.name}
      type="text"
      value={property.value}
      onchange={(event) => onUpdate(property.name, event.target.value)}
      placeholder="No value" />
  {:else if property.type === "list"}
    <div
      class="rounded-field bordered inline-flex flex-wrap items-center gap-1 px-1">
      {#each property.value as item, index}
        <div
          class="rounded-selector inline-flex items-center bg-(--color-base-200) p-1 text-sm hover:bg-(--color-bg-hover)">
          <span>{item}</span>
          {#if !readonly}
            <Button
              cssClass="mr-[-0.25rem] text-base-content/50"
              onclick={() => removeListItem(index)}
              aria-label="Remove item"
              size="small"
              shape="square">
              <XIcon size="14" />
            </Button>
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
          bind:this={inputElement} />
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
      disabled={readonly} />
  {:else if property.type === "check"}
    <input
      name={property.name}
      type="checkbox"
      checked={property.value}
      onchange={(e) => onUpdate(property.name, e.target.checked)}
      disabled={readonly} />
  {:else if property.type === "date"}
    <input
      name={property.name}
      type="date"
      value={property.value instanceof Date
        ? property.value.toISOString().split("T")[0]
        : property.value}
      onchange={(e) => onUpdate(property.name, new Date(e.target.value))}
      disabled={readonly} />
  {:else if property.type === "datetime"}
    <input
      name={property.name}
      type="datetime-local"
      value={property.value instanceof Date
        ? formatDateTimeForInput(property.value.toISOString())
        : formatDateTimeForInput(property.value)}
      onchange={(e) => onUpdate(property.name, new Date(e.target.value))}
      disabled={readonly} />
  {/if}
</li>
