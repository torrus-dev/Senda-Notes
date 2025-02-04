<script>
  let { title, onTitleChange } = $props();

  let editableElement;
</script>

<h1
  class="text-4xl font-bold mb-3"
  contenteditable="true"
  onblur={() => {
    onTitleChange(editableElement.innerText);
  }}
  bind:this={editableElement}
>
  {title}
</h1>
