<script>
import { noteController } from "@controllers/noteController.svelte";
import Button from "@components/utils/Button.svelte";
import NoteTreeLine from "./NoteTreeLine.svelte";
import NoteTreeNode from "./NoteTreeNode.svelte";
import { PlusIcon } from "lucide-svelte";
import Collapsible from "@components/utils/Collapsible.svelte";

let rootNotes = $derived(noteController.getRootNotes());
let childrenCount = $derived(noteController.getNoteCount());
</script>

{#snippet headingContent()}
   <div class="group flex flex-row justify-between gap-2 pr-2">
      <p>Notes</p>
      <div class="flex items-center">
         <Button
            onclick={() => noteController.createNote()}
            class="p-1 opacity-0 group-hover:opacity-100"
            size="small"
            title="Add note">
            <PlusIcon size="1.125em"></PlusIcon>
         </Button>
         {#if childrenCount > 0}
            <p class="text-base-content/50 ml-1">{childrenCount}</p>
         {/if}
      </div>
   </div>
{/snippet}

<Collapsible headingContent={headingContent} chevronPosition="left">
   <ul class="w-full px-2">
      {#if rootNotes && rootNotes.length > 0}
         {#each rootNotes as note, index (note.id)}
            <NoteTreeNode note={note} position={index} />
         {/each}
         <NoteTreeLine position={rootNotes.length} />
      {/if}
   </ul>
</Collapsible>
