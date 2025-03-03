<script>
import { noteController } from "../../controllers/noteController.svelte";
import Button from "../Button.svelte";
import NoteTreeLine from "./NoteTreeLine.svelte";
import NoteTreeNode from "./NoteTreeNode.svelte";
import { PlusIcon } from "lucide-svelte";

let rootNotes = $derived(noteController.getRootNotes());
let childrenCount = $derived(noteController.getNoteCount());
</script>

<ul class="rounded-box w-full p-2">
  <li class="group flex flex-row justify-between gap-2 px-2 pt-2 pb-1">
    <p class="text-muted-content">Notes</p>
    <div class="flex items-center">
      <Button
        onclick={() => noteController.createNote()}
        cssClass="opacity-0 group-hover:opacity-100 p-1"
        size="small"
        title="Add note">
        <PlusIcon size="18"></PlusIcon>
      </Button>
      {#if childrenCount > 0}
        <p class="text-base-content/60 ml-1">{childrenCount}</p>
      {/if}
    </div>
  </li>
  {#if rootNotes && rootNotes.length > 0}
    {#each rootNotes as note, index (note.id)}
      <NoteTreeNode note={note} position={index} />
    {/each}
    <NoteTreeLine position={rootNotes.length} />
  {/if}
</ul>
