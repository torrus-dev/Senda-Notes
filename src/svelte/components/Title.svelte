<script>
  let { title, onTitleChange } = $props();

  let editableElement;
</script>

<h1
  contenteditable="true"
  onblur={() => {
    onTitleChange(editableElement.innerText);
  }}
  bind:this={editableElement}
>
  {title}
</h1>
