<style>
</style>

<script lang="ts">
import { dndController } from "@controllers/ui/dndController.svelte";
import {
   createNoteTreeNodeDndHandlers,
   checkDraggingBranch,
} from "@utils/dnd/noteTreeDndEvents.svelte";

import NoteTreeNode from "./NoteTreeNode.svelte";
import NoteTreeLine from "./NoteTreeLine.svelte";
import NoteTreeLabel from "./NoteTreeLabel.svelte";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";

let { note, position } = $props();

let isExpanded = $state(true);
let isDragedOver = $state(false);
let isDragged = $derived(
   dndController.dragSource &&
      dndController.dragSource.type === "notetree-note" &&
      dndController.dragSource.id === note.id,
);
let branchDragging = $derived(checkDraggingBranch(note.id));
let isEditingTitle: boolean = $state(false);

// Setup drag and drop
const {
   handleDragStart,
   handleDragOver,
   handleDragEnd,
   handleDragLeave,
   handleDrop,
} = createNoteTreeNodeDndHandlers({
   noteId: note.id,
   parentId: note.parentId,
   getNotePosition: () => position,
   setIsDraggedOver: (newValue) => (isDragedOver = newValue),
   getBranchDragging: () => branchDragging,
});

const toggleExpansion = (event: Event) => {
   event.stopPropagation();
   isExpanded = !isExpanded;
};

function toggleEditTitleMode() {
   isEditingTitle = !isEditingTitle;
}
</script>

<NoteTreeLine position={position} parentId={note.parentId} />

<li
   class="group/node rounded-field cursor-pointer bg-transparent transition-colors duration-300
    {isDragedOver ? 'highlight' : ''} 
    {isDragged ? 'opacity-50' : ''}"
   draggable={!isEditingTitle}
   ondragstart={handleDragStart}
   ondragover={handleDragOver}
   ondragend={handleDragEnd}
   ondragleave={handleDragLeave}
   ondrop={handleDrop}>
   <NoteTreeLabel
      note={note}
      toggleExpansion={toggleExpansion}
      isExpanded={isExpanded}
      isEditingTitle={isEditingTitle}
      toggleEditTitleMode={toggleEditTitleMode} />

   {#if isExpanded && note.children && note.children.length > 0}
      <ul class="border-base-400/60 ml-2.5 border-l-2">
         {#each note.children as childNoteId, index (childNoteId)}
            <NoteTreeNode
               note={noteQueryController.getNoteById(childNoteId)}
               position={index} />
         {/each}
         <NoteTreeLine position={note.children.length} parentId={note.id} />
      </ul>
   {/if}
</li>
