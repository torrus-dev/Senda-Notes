<script>
  import { noteController } from "../noteController.svelte";

  let { id } = $props();
  let title = $derived(noteController.getNoteById(id).title);

  function handleTitleChange(newTitle) {
    if (title) {
      noteController.updateNote(id, {
        title: noteController.sanitizeTitle(newTitle),
      });
    }
  }
  let editableElement;
</script>

<h1
  bind:this={editableElement}
  class="text-4xl font-bold my-6"
  contenteditable="true"
  onblur={() => {
    handleTitleChange(editableElement.innerText);
  }}
>
  {title}
</h1>
