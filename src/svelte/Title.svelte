<script>
  export let title;
  export let onTitleChange;

  let editableElement;

  function handlePaste() {
    // Guarda la posición del cursor
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const cursorPosition = range.startOffset;

    const sanitizedText = sanitizeTitle(editableElement.innerText);

    // Actualiza solo si el texto cambia
    if (editableElement.innerText !== sanitizedText) {
      editableElement.innerText = sanitizedText;

      // Restaura la posición del cursor
      const newRange = document.createRange();
      newRange.setStart(
        editableElement.firstChild || editableElement,
        cursorPosition,
      );
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  }

  function updateTitle() {
    if (onTitleChange) {
      onTitleChange(editableElement.innerText);
    }
  }

  function sanitizeTitle(text) {
    // Elimina saltos de línea, pero conserva espacios finales y limita a 100 caracteres
    return text.replace(/[\n\r]+/g, "").slice(0, 100);
  }
</script>

<h1
  contenteditable="true"
  onpaste={handlePaste}
  onblur={updateTitle}
  bind:this={editableElement}
>
  {title}
</h1>
