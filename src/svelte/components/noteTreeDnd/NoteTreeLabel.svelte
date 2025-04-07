<style>
.isExpanded div {
   transform: rotate(90deg);
}
</style>

<script lang="ts">
import { noteController } from "@controllers/noteController.svelte";
import {
   ChevronRightIcon,
   PlusIcon,
   PenLineIcon,
   Trash2Icon,
} from "lucide-svelte";
import Button from "@components/utils/Button.svelte";
import InlineTitleEditor from "@components/utils/InlineTitleEditor.svelte";
import { contextMenu } from "@directives/floatingMenuDirective.svelte";
import type { Note } from "@projectTypes/noteTypes";
import { SvelteComponent } from "svelte";

let {
   note,
   toggleExpansion,
   isExpanded,
}: {
   note: Note;
   toggleExpansion: (event: Event) => void;
   isExpanded: boolean;
} = $props();

let isActive = $derived(note.id === noteController.activeNoteId);
let childrenCount = $derived(noteController.getChildrenCount(note.id));
let hasChildren = $derived(childrenCount > 0);

let isEditingTitle = $state(false);

const handleSelectTitle = (event: KeyboardEvent | MouseEvent) => {
   if (!isEditingTitle) {
      if (("key" in event && event.key === "Enter") || event.type === "click") {
         // Solo seleccionar la nota si no estamos en modo edición
         noteController.setActiveNote(note.id);
      }
   }
};

const startEditingLabel = () => {
   isEditingTitle = true;
};
const stopEditingLabel = () => {
   isEditingTitle = false;
};

// Referencia al componente InlineTitleEditor para acceder a su elemento DOM
let editableElement: SvelteComponent;
</script>

<div
   class="group rounded-field flex min-w-fit flex-row justify-between px-2 py-1.5 pl-1 whitespace-nowrap transition-colors select-none hover:bg-(--color-bg-hover)
      {isActive ? 'bg-(--color-bg-active)' : ''}"
   role="button"
   tabindex="0"
   use:contextMenu={[
      {
         type: "action",
         label: "Rename Note",
         icon: PenLineIcon,
         action: startEditingLabel,
      },
      {
         type: "action",
         label: "Delete Note",
         icon: Trash2Icon,
         action: () => noteController.deleteNote(note.id),
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
               <ChevronRightIcon size="1.0625rem" aria-hidden="true" />
            </div>
         </button>
      {:else}
         <span class="w-4"></span>
      {/if}

      <!-- Usando InlineTitleEditor y bindando la referencia al elemento -->
      <InlineTitleEditor
         bind:this={editableElement}
         noteId={note.id}
         noteTitle={note.title}
         isEditing={isEditingTitle}
         class="truncate {!isExpanded ? 'text-base-content/70' : ''}"
         onEditComplete={stopEditingLabel} />
   </div>
   <div class="flex items-center">
      <Button
         onclick={(event) => {
            event?.stopPropagation();
            noteController.createNote(note.id);
         }}
         class="text-base-content/70 p-1 opacity-0 group-hover:opacity-100"
         size="small">
         <PlusIcon size="1.125em"></PlusIcon>
      </Button>
      {#if childrenCount > 0}
         <p class="text-base-content/50 ml-1">
            {childrenCount}
         </p>
      {/if}
   </div>
</div>
