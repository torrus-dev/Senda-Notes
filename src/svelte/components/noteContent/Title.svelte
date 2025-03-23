<script>
import { noteController } from "../../controllers/noteController.svelte";
import { focusController } from "../../controllers/focusController.svelte";
import { FocusTarget } from "../../types/types";

// Props
let { note } = $props();

// Estado derivado
let id = $derived(note.id);
let title = $derived(note.title);

// Referencias
let editableElement;

// Eventos y manejadores
function handleTitleChange() {
  if (!editableElement) return;

  const newTitle = noteController.sanitizeTitle(editableElement.innerText);

  if (newTitle && newTitle.trim() !== "") {
    noteController.updateNote(id, { title: newTitle });
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
  } else if (e.key === "Enter") {
    e.preventDefault();
    handleTitleChange();
    editableElement.blur();
    focusController.requestFocus(FocusTarget.EDITOR);
  }
}

// Sincronizar el título cuando cambia externamente
$effect(() => {
  if (editableElement && title !== editableElement.innerText) {
    editableElement.innerText = title;
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
  const { targetId, timestamp } = focusController.focus;
  if (targetId === FocusTarget.TITLE && timestamp > 0 && editableElement) {
    focusController.selectAllText(FocusTarget.TITLE);
  }
});
</script>

<h1
  id="title"
  bind:this={editableElement}
  class="mt-16 overflow-hidden font-bold sm:text-xl lg:text-3xl 2xl:text-4xl"
  contenteditable="true"
  onblur={handleTitleChange}
  onkeydown={handleKeydown}>
  <!-- El contenido visible lo controla directamente el campo contenteditable -->
</h1>
