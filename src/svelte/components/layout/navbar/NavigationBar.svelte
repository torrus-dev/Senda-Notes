<script lang="ts">
import MoreButton from "@components/layout/navbar/MoreButton.svelte";
import Breadcrumbs from "@components/utils/Breadcrumbs.svelte";
import { noteQueryController } from "@controllers/noteQueryController.svelte";
import type { Note } from "@projectTypes/noteTypes";

let { note }: { note: Note | undefined } = $props();
let notePath = note?.id ? noteQueryController.getPathFromNoteId(note?.id) : "";
let searchQuery: string = $state(notePath);
let isSearching = $state(false);
</script>

<div class="bg-base-200 rounded-field flex h-10 w-full justify-between gap-2">
   <div class="flex w-full items-center px-3">
      {#if isSearching}
         <div
            class="flex-grow outline-none"
            contenteditable="true"
            bind:innerHTML={searchQuery}>
            {notePath}
         </div>
      {:else}
         <Breadcrumbs noteId={note?.id} />
         <button
            class="w-full p-2 text-left"
            onclick={() => {
               isSearching = true;
            }}>{note?.title}</button>
      {/if}
   </div>
   <div class="flex gap-1">
      {#if note}
         <MoreButton noteId={note.id} />
      {/if}
   </div>
</div>
