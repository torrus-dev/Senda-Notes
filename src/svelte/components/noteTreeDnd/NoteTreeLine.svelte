<style>
</style>

<script>
import { dndController } from "@controllers/dndController.svelte";
import {
   createNoteTreeLineDndHandlers,
   checkDraggingBranch,
} from "@utils/dnd/noteTreeDndEvents.svelte";

let { position, parentId = undefined } = $props();
let isDragedOver = $state(false);
let branchDragging = $derived(checkDraggingBranch(parentId));

// Setup drag and drop
const { handleDragOver, handleDragLeave, handleDrop } =
   createNoteTreeLineDndHandlers({
      parentId,
      getLinePosition: () => position,
      getBranchDragging: () => branchDragging,
      setIsDraggedOver: (val) => (isDragedOver = val),
   });
</script>

<li
   class="
      bg-transaprent relative top-0 left-0 z-20 my-[-4px] flex h-2.5 cursor-pointer items-center transition-all duration-300
      {isDragedOver ? 'highlight' : ''}
      {!dndController.isDragging ? 'invisible' : ''}
   "
   role="region"
   ondragover={handleDragOver}
   ondragleave={handleDragLeave}
   ondrop={handleDrop}>
</li>
