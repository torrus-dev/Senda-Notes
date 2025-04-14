<script lang="ts">
import MoreButton from "@components/layout/navbar/MoreButton.svelte";
import Breadcrumbs from "@components/utils/Breadcrumbs.svelte";
import { noteQueryController } from "@controllers/noteQueryController.svelte";
import { onOutsideOrEsc } from "@directives/onOutsideOrEsc";
import type { Note } from "@projectTypes/noteTypes";

let { note }: { note: Note | undefined } = $props();
let notePath: string = $state("");
const getNotePath = () =>
   note?.id ? noteQueryController.getPathFromNoteId(note?.id) : "";
let isSearching = $state(false);
let searchInnerText: string = $state("");

function activateSearch() {
   isSearching = true;
   searchInnerText = getNotePath();
}
function closeSearch() {
   isSearching = false;
}
</script>

<div class="bg-base-200 rounded-field flex h-10 w-full justify-between gap-2">
   <div class="flex w-full items-center">
      {#if isSearching}
         <div
            class="outline-interactive-accent-focus rounded-field flex-grow items-center p-1.5 font-mono outline-2"
            contenteditable="true"
            use:onOutsideOrEsc={{
               action: closeSearch,
               preventOnClickOutside: true,
            }}
            bind:innerText={searchInnerText}>
            {notePath}
         </div>
      {:else}
         {#if note}
            <Breadcrumbs noteId={note.id} />
         {/if}
         <button
            class="w-full p-2 text-left"
            onclick={() => {
               activateSearch();
            }}>
            {#if note}
               {note?.title}
            {:else}
               Inicio
            {/if}
         </button>
      {/if}
   </div>
   <div class="flex gap-1">
      {#if note}
         <MoreButton noteId={note.id} />
      {/if}
   </div>
</div>
