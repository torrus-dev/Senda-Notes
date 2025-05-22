<script lang="ts">
import { sanitizeTitle } from "@utils/noteUtils";

import { noteController } from "@controllers/note/noteController.svelte";
import { focusController } from "@controllers/focusController.svelte";
import { FocusTarget } from "@projectTypes/focusTypes";
import Popover from "@components/floating/Popover.svelte";

// Props
let { noteId, noteTitle }: { noteId: string; noteTitle: string } = $props();

// Referencias y estado
let editableElement: HTMLElement | undefined = $state();
let containsSlash = $state(false);

// Función para verificar si el texto contiene caracteres prohibidos
function checkForbiddenChars() {
   if (!editableElement) return;
   containsSlash = editableElement.innerText.includes("/");
}

// Eventos y manejadores
function handleTitleChange() {
   if (!editableElement) return;
   const newTitle = sanitizeTitle(editableElement.innerText);
   if (newTitle && newTitle.trim() !== "") {
      noteController.updateNoteTitle(noteId, newTitle);
   } else {
      // Restaurar el título original en el elemento editable
      editableElement.innerText = noteTitle;
   }
   // Actualizar el estado después de procesar el cambio
   checkForbiddenChars();
}

function handleKeydown(event: KeyboardEvent) {
   if (!editableElement) return;
   if (event.key === "Escape") {
      // Cancelar edición
      editableElement.innerText = noteTitle; // Restaurar valor original
      editableElement.blur();
      containsSlash = false;
   } else if (event.key === "Enter") {
      event.preventDefault();
      handleTitleChange();
      // investigar porque crea loop de $effect el poner esta linea
      // focusController.requestFocus(FocusTarget.EDITOR);
   }
}

function handleInput() {
   checkForbiddenChars();
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
   onkeydown={handleKeydown}
   oninput={handleInput}>
   <!-- El contenido visible lo controla directamente el campo contenteditable -->
</h1>

{#if editableElement}
   <Popover
      isOpen={containsSlash}
      class="bg-error-bg p-2"
      htmlElement={editableElement}
      placement="top"
      alignment="center">
      Note title cannot contain "/"
   </Popover>
{/if}
