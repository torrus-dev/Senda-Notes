<script lang="ts">
import MoreButton from "@components/layout/navbar/MoreButton.svelte";
import Breadcrumbs from "@components/utils/Breadcrumbs.svelte";
import { noteQueryController } from "@controllers/noteQueryController.svelte";
import { onOutsideOrEsc } from "@directives/onOutsideOrEsc";
import type { Note } from "@projectTypes/noteTypes";
import { tick } from "svelte";

let { note }: { note: Note | undefined } = $props();
const getNotePath = () =>
   note?.id ? noteQueryController.getPathFromNoteId(note?.id) : "";
let isSearching = $state(false);
let searchValue: string = $state("");
let searchElement: HTMLInputElement | undefined = $state(undefined);

function startSearch() {
   isSearching = true;
   searchValue = getNotePath();
   // Esperar a que Svelte renderice el searchElement
   tick().then(() => {
      if (searchElement) {
         searchElement.focus();
      }
   });
}
function endSearch() {
   isSearching = false;
}
</script>

<div class="bg-base-200 rounded-field flex h-10 w-full justify-between">
   <div class="flex w-full items-center">
      {#if isSearching}
         <input
            type="text"
            class="outline-interactive-accent-focus rounded-field flex-grow items-center p-1.5 outline-2"
            bind:this={searchElement}
            bind:value={searchValue}
            placeholder="Search Notes..."
            use:onOutsideOrEsc={{
               action: endSearch,
            }} />
      {:else}
         {#if note}
            <Breadcrumbs noteId={note.id} />
         {/if}
         <button
            class="w-full p-2 text-left"
            onclick={() => {
               startSearch();
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
