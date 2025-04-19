<script lang="ts">
import { noteQueryController } from "@controllers/noteQueryController.svelte";

import NoteTreeLine from "./NoteTreeLine.svelte";
import NoteTreeNode from "./NoteTreeNode.svelte";
import Collapsible from "@components/utils/Collapsible.svelte";

import { workspace } from "@controllers/workspaceController.svelte";
import NotesSectionHeader from "./NotesSectionHeader.svelte";

let rootNotes = $derived(noteQueryController.getRootNotes());
let isDragedOver = $state();
</script>

{#snippet headingContent()}
   <NotesSectionHeader bind:isDragedOver={isDragedOver} />
{/snippet}

<Collapsible
   headingContent={headingContent}
   headingClass="text-muted-content border-base-400 rounded-field
   {isDragedOver ? 'highlight' : ''}"
   hasSeparator={true}
   chevronPosition="left"
   startCollapsed={workspace.isNotesCollapsed()}
   oncollapse={() => {
      workspace.toogleNotesCollapsed();
   }}>
   <ul class="max-h-[50vh] w-full overflow-auto px-2">
      {#if rootNotes && rootNotes.length > 0}
         {#each rootNotes as note, index (note.id)}
            <NoteTreeNode note={note} position={index} />
         {/each}
         <NoteTreeLine position={rootNotes.length} />
      {/if}
   </ul>
</Collapsible>
