<style>
</style>

<script>
import { noteController } from "../../../controllers/noteController.svelte";
import { dndController } from "../../../controllers/dndController.svelte";
import NoteTreeNode from "./NoteTreeNode.svelte";
import NoteTreeLine from "./NoteTreeLine.svelte";
import NoteTreeLabel from "./NoteTreeLabel.svelte";
import {
   createNoteTreeNodeDndHandlers,
   checkDraggingBranch,
} from "../../../lib/utils/dnd/NoteTreeDndUtils.svelte";

let { note, position = -1 } = $props();

let isExpanded = $state(true);
let isDragedOver = $state(false);
let isDragged = $derived(
   dndController.dragSource &&
      dndController.dragSource.type === "notetree-note" &&
      dndController.dragSource.id === note.id,
);
let branchDragging = $derived(checkDraggingBranch(note.id));

const getBranchDragging = () => branchDragging;

// Setup drag and drop
const {
   handleDragStart,
   handleDragEnd,
   handleDragOver,
   handleDragLeave,
   handleDrop,
} = createNoteTreeNodeDndHandlers({
   noteId: note.id,
   getNotePosition: () => position,
   setIsDraggedOver: (val) => (isDragedOver = val),
   getBranchDragging,
});

const toggleExpansion = (event) => {
   event.stopPropagation();
   isExpanded = !isExpanded;
};
</script>

<NoteTreeLine position={position} parentId={note.parentId} />

<li
   class="group/node rounded-field cursor-pointer bg-transparent transition-colors duration-300
    {isDragedOver ? 'highlight' : ''} 
    {isDragged ? 'opacity-50' : ''}"
   draggable="true"
   ondragstart={handleDragStart}
   ondragend={handleDragEnd}
   ondragover={handleDragOver}
   ondragleave={handleDragLeave}
   ondrop={handleDrop}>
   <NoteTreeLabel
      note={note}
      toggleExpansion={toggleExpansion}
      isExpanded={isExpanded} />

   {#if isExpanded && note.children && note.children.length > 0}
      <ul class="border-base-400/60 ml-2.5 border-l-2">
         {#each note.children as noteId, index}
            <NoteTreeNode
               note={noteController.getNoteById(noteId)}
               position={index} />
         {/each}
         <NoteTreeLine position={note.children.length} parentId={note.id} />
      </ul>
   {/if}
</li>
