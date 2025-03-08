<script>
import { noteController } from "../../controllers/noteController.svelte";
import { focusController } from "../../controllers/focusController.svelte";
import { FocusTarget } from "../../types/types";

let { note } = $props();
let id = $derived(note.id);
let title = $derived(note.title);
let newTitle = $state(note.title);

function handleTitleChange() {
  if (!title || !newTitle) return;
  newTitle = noteController.sanitizeTitle(newTitle);

  if (newTitle !== "" && newTitle !== " ") {
    noteController.updateNote(id, {
      title: newTitle,
    });
  } else {
    console.log("titulo invalido");
    newTitle = title;
  }
}
const handleKeydown = (e) => {
  if (e.key === "Escape") {
    editableElement.blur();
  }
  if (e.key === "Enter") {
    e.preventDefault();
    handleTitleChange();
    editableElement.blur();
    focusController.requestFocus(FocusTarget.EDITOR);
  }
};

let editableElement;

// Registrar el elemento con el focusController
$effect(() => {
  if (editableElement) {
    focusController.registerElement(FocusTarget.TITLE, editableElement);

    return () => {
      focusController.unregisterElement(FocusTarget.TITLE);
    };
  }
});

// Efecto separado para la selección de texto
$effect(() => {
  const { targetId, timestamp } = focusController.focus;
  if (targetId === FocusTarget.TITLE && timestamp > 0) {
    focusController.selectAllText(FocusTarget.TITLE);
  }
});
</script>

<h1
  bind:this={editableElement}
  class="my-6 text-4xl font-bold"
  contenteditable="true"
  onblur={() => {
    handleTitleChange();
  }}
  onkeydown={handleKeydown}
  bind:innerText={newTitle}>
</h1>
