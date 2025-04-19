<script lang="ts">
import { sanitizeTitle } from "@utils/noteUtils";

import { noteController } from "@controllers/noteController.svelte";
import { focusController } from "@controllers/focusController.svelte";
import { FocusTarget } from "@projectTypes/focusTypes";
import Popover from "@components/floating/popover/Popover.svelte";
import { noteQueryController } from "@controllers/noteQueryController.svelte";

// Props
let { noteId }: { noteId: string } = $props();

let savedNoteTitle: string | undefined = $derived(
   noteQueryController.getTitleById(noteId),
);

// Referencias
let editableElement: HTMLElement | undefined = $state();

// Eventos y manejadores
function handleTitleChange() {
   if (!editableElement) return;
   const newTitle = sanitizeTitle(editableElement.innerText);
   if (newTitle && newTitle.trim() !== "") {
      noteController.updateNote(noteId, { title: newTitle });
   }
}

function handleKeydown(event: KeyboardEvent) {
   if (!editableElement) return;
   if (event.key === "Escape") {
      // Cancelar edición
      editableElement.innerText = savedNoteTitle ?? ""; // Restaurar valor original
      editableElement.blur();
   } else if (event.key === "Enter") {
      event.preventDefault();
      handleTitleChange();
      // focusController.requestFocus(FocusTarget.EDITOR);
   }
}

// Sincronizar el título cuando cambia externamente
$effect(() => {
   if (editableElement && savedNoteTitle) {
      editableElement.innerText = savedNoteTitle;
   }
});

// Registrar el elemento con el focusController
$effect(() => {
   if (editableElement) {
      focusController.registerElement(FocusTarget.TITLE, editableElement);

      return () => {
         focusController.unregisterElement(FocusTarget.TITLE);
      };
   }
});

// Enfocar titulo cuando se mande desde focusController
$effect(() => {
   const { targetId, timestamp } = focusController.focus;
   if (targetId === FocusTarget.TITLE && timestamp > 0 && editableElement) {
      focusController.selectAllText(FocusTarget.TITLE);
   }
});
</script>

<h1
   id="title"
   bind:this={editableElement}
   class="overflow-h mt-16 font-bold"
   contenteditable="true"
   onblur={handleTitleChange}
   onkeydown={handleKeydown}>
   <!-- El contennoteIdo visible lo controla directamente el campo contenteditable -->
</h1>

<Popover
   isOpen={true}
   styles="bg-error-bg"
   htmlElement={editableElement}
   placement="top">
   Note title cannot contain "/"
</Popover>
