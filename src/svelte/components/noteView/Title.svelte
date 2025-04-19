<script lang="ts">
import { sanitizeTitle } from "@utils/noteUtils";

import { noteController } from "@controllers/noteController.svelte";
import { focusController } from "@controllers/focusController.svelte";
import { FocusTarget } from "@projectTypes/focusTypes";
import Popover from "@components/floating/popover/Popover.svelte";

// Props
let { noteId, noteTitle }: { noteId: string; noteTitle: string } = $props();

let invalidPopover = $state({
   isOpen: false,
   message: 'Note title cannot contain "/"',
   styles: "",
});

// Referencias
let editableElement: HTMLElement;

// Eventos y manejadores
function handleTitleChange() {
   if (!editableElement) return;

   const newTitle = sanitizeTitle(editableElement.innerText);

   if (newTitle && newTitle.trim() !== "") {
      noteController.updateNote(noteId, { title: newTitle });
   } else {
      // Restaurar el título original en el elemento editable
      editableElement.innerText = noteTitle;
   }
}

function handleKeydown(event: KeyboardEvent) {
   if (event.key === "Escape") {
      // Cancelar edición
      editableElement.innerText = noteTitle; // Restaurar valor original
      editableElement.blur();
   } else if (event.key === "Enter") {
      event.preventDefault();
      handleTitleChange();
      editableElement.blur();
      focusController.requestFocus(FocusTarget.EDITOR);
   }
}

// Sincronizar el título cuando cambia externamente
$effect(() => {
   if (editableElement && noteTitle !== editableElement.innerText) {
      editableElement.innerText = noteTitle;
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

$effect(() => {
   // Register title in focus controller
   const { targetId, timestamp } = focusController.focus;
   if (targetId === FocusTarget.TITLE && timestamp > 0 && editableElement) {
      console.log("title element", editableElement);
      focusController.selectAllText(FocusTarget.TITLE);
   }
});
</script>

<h1
   id="title"
   bind:this={editableElement}
   class="overflow-hnoteIdden mt-16 font-bold"
   contenteditable="true"
   onblur={handleTitleChange}
   onkeydown={handleKeydown}>
   <!-- El contennoteIdo visible lo controla directamente el campo contenteditable -->
</h1>

<Popover
   isOpen={invalidPopover.isOpen}
   styles={invalidPopover.styles}
   htmlElement={editableElement}>
   {invalidPopover.message}
</Popover>
