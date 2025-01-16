<script>
  export let title;
  export let onTitleChange;

  let editableElement;

  function handleInput() {
    const sanitizedText = sanitizeTitle(editableElement.innerText);
    if (editableElement.innerText !== sanitizedText) {
      editableElement.innerText = sanitizedText;
    }
  }

  function updateTitle() {
    if (onTitleChange) {
      onTitleChange(editableElement.innerText);
    }
  }

  function sanitizeTitle(text) {
    // Elimina saltos de línea, conserva espacios al final, max 100 caracteres
    return text.replace(/^[\s]+|[\n\r]+/g, "").slice(0, 100);
  }
</script>

<h1
  contenteditable="true"
  oninput={handleInput}
  onblur={updateTitle}
  bind:this={editableElement}
>
  {title}
</h1>
