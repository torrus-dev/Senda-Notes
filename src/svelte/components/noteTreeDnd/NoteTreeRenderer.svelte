<script lang="ts">
import { noteController } from "@controllers/noteController.svelte";
import { noteQueryController } from "@controllers/noteQueryController.svelte";
import Button from "@components/utils/Button.svelte";
import NoteTreeLine from "./NoteTreeLine.svelte";
import NoteTreeNode from "./NoteTreeNode.svelte";
import { FilePlusIcon, PlusIcon } from "lucide-svelte";
import Collapsible from "@components/utils/Collapsible.svelte";
import { contextMenu } from "@directives/floatingMenuDirective.svelte";

let rootNotes = $derived(noteQueryController.getRootNotes());
let childrenCount = $derived(noteQueryController.getNoteCount());
</script>

{#snippet headingContent()}
   <div
      class="group flex flex-row justify-between gap-2 pr-2"
      use:contextMenu={[
         {
            type: "action",
            label: "New Note",
            icon: FilePlusIcon,
            action: () => {
               noteController.createNote();
            },
         },
      ]}>
      <header>Notes</header>
      <div class="flex items-center">
         <Button
            onclick={(event: MouseEvent) => {
               noteController.createNote();
               event.stopPropagation();
            }}
            class="text-muted-content p-1 opacity-0 group-hover:opacity-100"
            size="small"
            title="Add note">
            <PlusIcon size="1.125em"></PlusIcon>
         </Button>
         {#if childrenCount > 0}
            <p class="text-faint-content ml-1">{childrenCount}</p>
         {/if}
      </div>
   </div>
{/snippet}

<Collapsible headingContent={headingContent} chevronPosition="left">
   <ul class="max-h-[50vh] w-full overflow-auto px-2">
      {#if rootNotes && rootNotes.length > 0}
         {#each rootNotes as note, index (note.id)}
            {console.log("a")}
            <NoteTreeNode note={note} position={index} />
         {/each}
         <NoteTreeLine position={rootNotes.length} />
      {/if}
   </ul>
</Collapsible>
