<script lang="ts">
import { noteController } from "@controllers/notes/NoteController.svelte";
import { noteQueryController } from "@controllers/notes/NoteQueryController.svelte";
import { FilePlusIcon, PlusIcon } from "lucide-svelte";
import { contextMenu } from "@directives/floatingMenuDirective.svelte";
import Button from "@components/utils/Button.svelte";
import { dndController } from "@controllers/ui/DNDController.svelte";

let { isDragedOver = $bindable() } = $props();

function handleDragOver(event: DragEvent) {
   event.preventDefault();
   event.stopPropagation();
   isDragedOver = true;
}
function handleDragLeave(event: DragEvent) {
   event.preventDefault();
   event.stopPropagation();
   isDragedOver = false;
}
function handleDrop(event: DragEvent) {
   event.preventDefault();
   event.stopPropagation();
   isDragedOver = false;

   dndController.setDropTarget({
      type: "notetree-line",
      position: 0,
      data: {
         parentId: undefined,
      },
   });

   dndController.handleDrop();
}
</script>

<div
   class="group flex flex-row justify-between gap-2 pr-2"
   ondragover={handleDragOver}
   ondragleave={handleDragLeave}
   ondrop={handleDrop}
   role="directory"
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
   <header class="">Notes</header>
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
      <p class="text-faint-content ml-1">
         {noteQueryController.getStats().totalNotes}
      </p>
   </div>
</div>
