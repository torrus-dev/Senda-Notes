<script>
  export let title;
  export let onTitleChange;

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
