<style>
.highlight div {
  background-color: darkblue;
}
</style>

<script>
  import { dndController } from "../../controllers/dndController.svelte";

let { 
  index = -1,
  depth = 0, 
  parentId = null 
} = $props();
let isDragedOver = $state(false);

const handleDragOver = (event) => {
  event.preventDefault();
  isDragedOver = true;
};

const handleDragLeave = (event) => {
  event.preventDefault();
  isDragedOver = false;
};

const handleDrop = (event) => {
  event.preventDefault();
  event.stopPropagation();

  dndController.dropNoteOnLineIndicator(parentId, index)
  
};
</script>

<li
  class="relative top-0 left-0 z-20 my-[-8px] flex h-5 cursor-pointer items-center {isDragedOver
    ? 'highlight'
    : ''}"
  role="region"
  data-index={index}
  data-depth={depth}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}>
  <div class="h-1 w-full transition-colors duration-200"></div>
</li>
