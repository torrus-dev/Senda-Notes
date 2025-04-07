<script lang="ts">
import { noteController } from "@controllers/noteController.svelte";
import { sanitizeTitle } from "@utils/noteUtils";

// Props
let {
   noteId,
   noteTitle,
   class: userClass = "",
   isEditing = false,
   onEditComplete = () => {}, // Callback opcional cuando se completa la edición
   onclick = () => {}, // Callback opcional para cuando se hace clic (para Breadcrumbs)
}: {
   noteId: string;
   noteTitle: string;
   class?: string;
   isEditing: boolean;
   onEditComplete: () => void;
   onclick?: (event?: MouseEvent) => void;
} = $props();

// Referencias
let editableElement: HTMLElement;

// Eventos y manejadores
function handleTitleChange() {
   if (!editableElement || !isEditing) return;

   const newTitle = sanitizeTitle(editableElement.innerText);

   if (newTitle && newTitle.trim() !== "") {
      noteController.updateNote(noteId, { title: newTitle });
      onEditComplete();
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
      onEditComplete();
   } else if (event.key === "Enter") {
      event.preventDefault();
      handleTitleChange();
      editableElement.blur();
      onEditComplete();
   }
}

function handleClick(event: MouseEvent) {
   if (onclick && !isEditing) {
      onclick();
   }
   // Si ya está en edición, permitir que el evento prosiga normalmente
}

// Sincronizar el título cuando cambia externamente
$effect(() => {
   if (editableElement && noteTitle !== editableElement.innerText) {
      editableElement.innerText = noteTitle;
   }
});

// Efecto para la selección de texto cuando entra en modo edición
$effect(() => {
   if (isEditing && editableElement) {
      // Enfoque al elemento y selección de todo el texto
      setTimeout(() => {
         editableElement.focus();
         const range = document.createRange();
         range.selectNodeContents(editableElement);
         const selection = window.getSelection();
         if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
         }
      }, 0);
   }
});

// Classes derivadas basadas en el estado de edición
const editingClass = $derived(isEditing ? "cursor-text underline" : "");
</script>

<span
   bind:this={editableElement}
   class="inline-block {userClass} {editingClass}"
   tabindex="0"
   role="textbox"
   contenteditable={isEditing}
   onblur={handleTitleChange}
   onclick={handleClick}
   onkeydown={isEditing ? handleKeydown : null}>
   {noteTitle}
</span>
