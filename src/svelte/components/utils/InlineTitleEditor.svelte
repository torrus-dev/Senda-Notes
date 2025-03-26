<script>
import { noteController } from "../../../controllers/noteController.svelte";
import { sanitizeTitle } from "../../../lib/utils/noteUtils";

// Props
let {
   note, // La nota cuyo título se está editando
   isEditing = false, // Estado para controlar si está en modo edición
   onEditComplete = () => {}, // Callback opcional cuando se completa la edición
   cssClass = "", // Clases CSS personalizables
   onclick = null, // Callback opcional para cuando se hace clic (para Breadcrumbs)
} = $props();

// Estado derivado
let id = $derived(note.id);
let title = $derived(note.title);

// Referencias
let editableElement;

// Eventos y manejadores
function handleTitleChange() {
   if (!editableElement || !isEditing) return;

   const newTitle = sanitizeTitle(editableElement.innerText);

   if (newTitle && newTitle.trim() !== "") {
      noteController.updateNote(id, { title: newTitle });
      onEditComplete();
   } else {
      // Restaurar el título original en el elemento editable
      editableElement.innerText = title;
   }
}

function handleKeydown(e) {
   if (e.key === "Escape") {
      // Cancelar edición
      editableElement.innerText = title; // Restaurar valor original
      editableElement.blur();
      onEditComplete();
   } else if (e.key === "Enter") {
      e.preventDefault();
      handleTitleChange();
      editableElement.blur();
      onEditComplete();
   }
}

function handleClick(e) {
   if (onclick && !isEditing) {
      onclick(e);
   }
   // Si ya está en edición, permitir que el evento prosiga normalmente
}

// Sincronizar el título cuando cambia externamente
$effect(() => {
   if (editableElement && title !== editableElement.innerText) {
      editableElement.innerText = title;
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
         selection.removeAllRanges();
         selection.addRange(range);
      }, 0);
   }
});
</script>

<span
   bind:this={editableElement}
   class="inline-block {cssClass} {isEditing ? 'cursor-text underline' : ''}"
   tabindex="0"
   role="textbox"
   contenteditable={isEditing}
   onblur={handleTitleChange}
   onclick={handleClick}
   onkeydown={isEditing ? handleKeydown : null}>
   {title}
</span>
