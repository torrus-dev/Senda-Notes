<script>
import { noteController } from "../controllers/noteController.svelte";
import { workspace } from "../controllers/workspaceController.svelte";
import { FocusTarget } from "../types/types";

let { id } = $props();
let title = $derived(noteController.getNoteById(id).title);

function handleTitleChange() {
  let newTitle = editableElement.innerText;
  if (title) {
    noteController.updateNote(id, {
      title: noteController.sanitizeTitle(newTitle),
    });
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
    workspace.requestFocus(FocusTarget.EDITOR);
  }
};
let editableElement;
</script>

<h1
  bind:this={editableElement}
  class="my-6 text-4xl font-bold"
  contenteditable="true"
  onblur={() => {
    handleTitleChange();
  }}
  onkeydown={handleKeydown}>
  {title}
</h1>
