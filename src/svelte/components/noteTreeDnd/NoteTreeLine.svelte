<style>
.highlight {
  background-color: var(--color-accent-indicator);
}
</style>

<script>
import { dndController } from "../../controllers/dndController.svelte";

let { position = -1, parentId = null, parentIsDragging } = $props();
let isDragedOver = $state(false);

const handleDragOver = (event) => {
  if (!parentIsDragging) {
    event.preventDefault();
    event.stopPropagation();
    isDragedOver = true;
  }
};

const handleDragLeave = (event) => {
  event.preventDefault();
  isDragedOver = false;
};

const handleDrop = (event) => {
  event.preventDefault();
  event.stopPropagation();
  isDragedOver = false;

  dndController.setDropTarget({
    type: "notetree-line",
    data: {
      parentId: parentId,
      position: position,
    },
  });
  dndController.handleDrop();
};
</script>

<li
  class="bg-transaprent relative top-0 left-0 z-20 my-[-4px] flex h-2.5 cursor-pointer items-center transition-colors duration-300 {isDragedOver
    ? 'highlight'
    : ''}"
  role="region"
  ondragover={handleDragOver}
  data-positon={position}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}>
</li>
