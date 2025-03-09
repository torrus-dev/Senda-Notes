<style>
</style>

<script>
import { createNoteTreeLineDndHandlers } from "./NoteTreeDnd.svelte";

let { id, position = -1, parentId = null, parentIsDragging } = $props();
let isDragedOver = $state(false);

// Setup drag and drop
const { handleDragOver, handleDragLeave, handleDrop } =
  createNoteTreeLineDndHandlers({
    id,
    position,
    parentId,
    setIsDraggedOver: (val) => (isDragedOver = val),
  });
</script>

<li
  class="bg-transaprent relative top-0 left-0 z-20 my-[-4px] flex h-2.5 cursor-pointer items-center transition-colors duration-300 {isDragedOver
    ? 'highlight'
    : ''}"
  role="region"
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}>
</li>
