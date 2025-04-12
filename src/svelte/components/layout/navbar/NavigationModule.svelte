<script lang="ts">
import { workspace } from "@controllers/workspaceController.svelte";
import type { Reference } from "@projectTypes/noteTypes";
import { FileIcon, SearchIcon } from "lucide-svelte";
let displayedContentType: "note" | "search" = $derived(
   workspace.getActiveNoteId() !== undefined ? "note" : "search",
);

let { note = undefined }: { note: Reference | undefined } = $props();
</script>

<div class="flex items-center">
   <span class="text-base-content/50 p-2">
      {#if displayedContentType === "search"}
         <SearchIcon size="1.125em" />
      {:else if displayedContentType === "note"}
         <FileIcon size="1.125em" />
      {/if}
   </span>

   <div class="overflow-x-auto p-1">
      {#if note}
         {note.title}
      {:else}
         <span class="text-base-content/70"> Buscar Notas... </span>
      {/if}
   </div>
</div>
