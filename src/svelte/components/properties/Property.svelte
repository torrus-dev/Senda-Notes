<style>
</style>

<script>
import { workspace } from "../../controllers/workspaceController.svelte";
import { propertyController } from "../../controllers/propertyController.svelte";

import { getIconComponent } from "./propertyUtils";
import { createDragAndDropHandlers } from "./PropertyDnd";

import { SlidersHorizontalIcon, Trash2Icon } from "lucide-svelte";

import DropdownList from "../DropdownList.svelte";
import PropertyValue from "./propertyTypes/PropertyValue.svelte";
import PropertyEditor from "./PropertyEditor.svelte";

let { noteId = null, position, property = null } = $props();

let isEditorOpen = $derived(
  workspace.isOpenPropertyEditor(noteId, property.id),
);

// setup drag and drop
let isDragedOver = $state(false);
const {
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDragLeave,
  handleDrop,
} = createDragAndDropHandlers({
  noteId,
  property,
  position,
  setIsDraggedOver: (val) => (isDragedOver = val),
});

// Obtener el componente de icono actual (derivado)
const IconComponent = $derived(getIconComponent(property.type));
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
          workspace.openPropertyEditor(noteId, property.id);
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
    ]}
    disabled={isEditorOpen}>
    {#snippet label()}
      {#if IconComponent}
        <span class="property-icon"><IconComponent size="18" /></span>
      {/if}
      <p class="w-[9rem] overflow-clip text-left">
        {property.name}
      </p>
    {/snippet}
  </DropdownList>
  <PropertyValue noteId={noteId} property={property}></PropertyValue>

  {#if isEditorOpen}
    <PropertyEditor noteId={noteId} property={property} />
  {/if}
</li>
