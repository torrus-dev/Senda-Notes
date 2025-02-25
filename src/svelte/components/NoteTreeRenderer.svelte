<script>
import { noteController } from "../noteController.svelte";
import Button from "./Button.svelte";
import NoteTreeNode from "./noteTreeDnd/NoteTreeNode.svelte";
import { PlusIcon } from "lucide-svelte";

let rootNotes = $derived(noteController.getRootNotes());
</script>

<ul class="rounded-box w-full p-2">
  <li class="group flex flex-row justify-between gap-2">
    <p class="text-muted-content">Notes</p>

    <Button
      onclick={() => noteController.createNote()}
      cssClass="opacity-0 group-hover:opacity-100 p-1"
      size="small">
      <PlusIcon size="18"></PlusIcon>
    </Button>
  </li>
  {#if rootNotes.length > 0}
    {#each rootNotes as note (note.id)}
      <NoteTreeNode note={note} depth={0} />
    {/each}
  {/if}
</ul>
