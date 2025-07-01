<script lang="ts">
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";

import NoteTreeLine from "@components/sidebar/noteTreeDnd/NoteTreeLine.svelte";
import NoteTreeNode from "@components/sidebar/noteTreeDnd/NoteTreeNode.svelte";
import NotesSectionHeader from "@components/sidebar/noteTreeDnd/NotesSectionHeader.svelte";
import Collapsible from "@components/utils/Collapsible.svelte";

let rootNotes = $derived(noteQueryController.getRootNotes());
let isDragedOver = $state();
</script>

{#snippet headingContent()}
   <NotesSectionHeader bind:isDragedOver={isDragedOver} />
{/snippet}

<Collapsible
   id="note-tree"
   headingContent={headingContent}
   headingClass="text-muted-content border-base-400 rounded-field
   {isDragedOver ? 'highlight' : ''}"
   hasSeparator={true}
   chevronPosition="left">
   <ul class="max-h-[70vh] w-full overflow-x-hidden overflow-y-auto px-2">
      {#if rootNotes && rootNotes.length > 0}
         {#each rootNotes as note, index (note.id)}
            <NoteTreeNode note={note} position={index} />
         {/each}
         <NoteTreeLine position={rootNotes.length} first={true} />
      {/if}
   </ul>
</Collapsible>
