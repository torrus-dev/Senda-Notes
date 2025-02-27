<style>
</style>

<script>
import NoteTreeNode from "./NoteTreeNode.svelte";
import { noteController } from "../../controllers/noteController.svelte";
import { dndController } from "../../controllers/dndController.svelte";
import NoteTreeLine from "./NoteTreeLine.svelte";
import NoteTreeLabel from "./NoteTreeLabel.svelte";

const { note, depth = 0, position = -1 } = $props();

let isExpanded = $state(true);

const toggleExpansion = (event) => {
  event.stopPropagation();
  isExpanded = !isExpanded;
};


</script>

<NoteTreeLine position={position} depth={depth} parentId={note.parentId} />

<li class="group/node cursor-pointer list-none">
  <NoteTreeLabel
    note={note}
    position={position}
    depth={depth}
    toggleExpansion={toggleExpansion}
    isExpanded={isExpanded} />

  {#if isExpanded && note.children.length > 0}
    <ul class="ml-3">
      {#each note.children as noteId, index}
        <NoteTreeNode
          note={noteController.getNoteById(noteId)}
          position={index}
          depth={depth + 1} />
      {/each}
      <NoteTreeLine
        position={note.children.length}
        depth={depth + 1}
        parentId={note.id} />
    </ul>
  {/if}
</li>
