<style>
</style>

<script lang="ts">
import { dndController } from "@controllers/ui/dndController.svelte";
import {
   createNoteTreeLineDndHandlers,
   checkDraggingBranch,
} from "@utils/dnd/noteTreeDndEvents.svelte";

let { position, parentId = undefined, first } = $props();
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
      bg-transaprent z-20 flex h-2.5 cursor-pointer items-center transition-all duration-300
      {!first ? 'my-[-4px]' : ''}
      {isDragedOver ? 'highlight' : ''}
      {!dndController.isDragging ? 'invisible' : ''}
   "
   role="region"
   ondragover={handleDragOver}
   ondragleave={handleDragLeave}
   ondrop={handleDrop}>
</li>
