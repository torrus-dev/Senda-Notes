<style>
.isExpanded div {
   transform: rotate(90deg);
}
</style>

<script>
import { noteController } from "../../../controllers/noteController.svelte";
import {
   ChevronRightIcon,
   PlusIcon,
   PenLineIcon,
   Trash2Icon,
} from "lucide-svelte";
import Button from "../utils/Button.svelte";
import InlineTitleEditor from "../utils/InlineTitleEditor.svelte";
import { contextMenu } from "../../../directives/floatingMenuDirective.svelte";

let { note, toggleExpansion, isExpanded } = $props();

let isActive = $derived(note.id === noteController.activeNoteId);
let childrenCount = $derived(noteController.getChildrenCount(note.id));
let hasChildren = $derived(childrenCount > 0);

let isEditingTitle = $state(false);

const handleSelectTitle = (event) => {
   if (!isEditingTitle) {
      if (event.key === "Enter" || event.type === "click") {
         // Solo seleccionar la nota si no estamos en modo edición
         noteController.setActiveNote(note.id);
      }
   }
};

const handleNewChildNote = (event) => {
   event.stopPropagation();
   noteController.createNote(note.id);
};

const startEditingLabel = () => {
   isEditingTitle = true;
};
const stopEditingLabel = () => {
   isEditingTitle = false;
};

// Referencia al componente InlineTitleEditor para acceder a su elemento DOM
let editableElement;
</script>

<div
   class="group rounded-field flex min-w-fit flex-row justify-between px-2 py-1.5 pl-1 whitespace-nowrap transition-colors select-none hover:bg-(--color-bg-hover)
      {isActive ? 'bg-(--color-bg-active)' : ''}"
   role="button"
   tabindex="0"
   use:contextMenu={[
      {
         label: "Rename Note",
         icon: PenLineIcon,
         onClick: startEditingLabel,
      },
      {
         label: "Delete Note",
         icon: Trash2Icon,
         onClick: () => noteController.deleteNote(note.id),
         class: "text-error",
      },
   ]}
   onclick={handleSelectTitle}
   onkeydown={handleSelectTitle}>
   <div class="flex gap-1">
      {#if hasChildren}
         <button
            class="transition-color rounded-selector cursor-pointer items-center whitespace-nowrap duration-200 ease-in-out hover:bg-(--color-bg-hover)
          {isExpanded ? 'isExpanded' : ''}"
            onclick={toggleExpansion}
            aria-expanded={isExpanded ? "true" : "false"}
            aria-label={isExpanded ? "Colapsar" : "Expandir"}>
            <div class="transition duration-200">
               <ChevronRightIcon size="16" aria-hidden="true" />
            </div>
         </button>
      {:else}
         <span class="w-4"></span>
      {/if}

      <!-- Usando InlineTitleEditor y bindando la referencia al elemento -->
      <InlineTitleEditor
         bind:this={editableElement}
         note={note}
         isEditing={isEditingTitle}
         cssClass="truncate"
         onEditComplete={stopEditingLabel} />
   </div>
   <div class="flex items-center">
      <Button
         onclick={handleNewChildNote}
         cssClass="text-base-content/70 opacity-0 group-hover:opacity-100 p-1"
         size="small"
         title="Add note inside">
         <PlusIcon size="18"></PlusIcon>
      </Button>
      {#if childrenCount > 0}
         <p class="text-base-content/50 ml-1">
            {childrenCount}
         </p>
      {/if}
   </div>
</div>
