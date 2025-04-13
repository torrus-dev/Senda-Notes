<script lang="ts">
import { noteQueryController } from "@controllers/noteQueryController.svelte";
import { SearchIcon } from "lucide-svelte";

let { noteId }: { noteId: string | undefined } = $props();
let notePath = $derived(
   noteId ? noteQueryController.getPathFromNoteId(noteId) : "",
);
</script>

<div class="flex w-full items-center px-4">
   <SearchIcon size={18} class="mr-2 text-gray-500" />

   <div class="-ml-6 flex-grow pl-6 outline-none" contenteditable="true">
      {notePath}
   </div>
</div>
