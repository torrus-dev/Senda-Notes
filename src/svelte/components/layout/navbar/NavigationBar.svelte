<script lang="ts">
import MoreButton from "@components/layout/navbar/MoreButton.svelte";
import Breadcrumbs from "@components/utils/Breadcrumbs.svelte";
import SearchResults from "@components/layout/navbar/SearchResults.svelte";
import { noteQueryController } from "@controllers/noteQueryController.svelte";
import { searchController } from "@controllers/searchController.svelte";
import { onOutsideOrEsc } from "@directives/onOutsideOrEsc";
import type { Note } from "@projectTypes/noteTypes";
import type { SearchResult } from "@controllers/searchController.svelte";
import { tick } from "svelte";
import { workspace } from "@controllers/workspaceController.svelte";
import { DeleteIcon, XIcon } from "lucide-svelte";
import Button from "@components/utils/Button.svelte";

let { note }: { note: Note | undefined } = $props();

const getNotePath = () =>
   note?.id ? noteQueryController.getPathFromNoteId(note?.id) : "";

let isSearching = $state(false);
let searchValue: string = $state("");
let searchElement: HTMLInputElement | undefined = $state(undefined);
let searchResults: SearchResult[] = $state([]);

// Buscar cuando cambia el valor de búsqueda
$effect(() => {
   if (isSearching && searchValue.trim()) {
      searchResults = searchController.searchNotes(searchValue);
   } else {
      searchResults = [];
   }
});

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
   searchValue = "";
   searchResults = [];
}

// Maneja la selección de un resultado
function handleResultSelect(event: CustomEvent<SearchResult>) {
   const result = event.detail;
   // Navegar a la nota seleccionada
   if (result.note && result.note.id) {
      // Aquí iría la navegación a la nota - implementación depende de tu router
      console.log(`Navigating to note: ${result.note.id}`);
      workspace.setActiveNoteId(result.note.id);
      endSearch();
   }
}
</script>

<div
   class="bg-base-200 rounded-field relative flex h-10 w-full justify-between {isSearching
      ? 'outline-interactive-accent-focus outline-2'
      : ''}">
   {#if isSearching}
      <div
         class=" rounded-field flex flex-grow pl-2.5"
         use:onOutsideOrEsc={{
            action: endSearch,
         }}>
         <input
            type="text"
            class=" w-full py-1.5 focus:outline-none"
            bind:this={searchElement}
            bind:value={searchValue}
            placeholder="Search Notes..." />

         <!-- Componente de resultados de búsqueda -->
         <SearchResults
            results={searchResults}
            searchValue={searchValue}
            on:select={handleResultSelect} />
         <div class="flex items-center">
            <Button title="Delete search">
               <DeleteIcon size="1.25em" />
            </Button>
            <Button title="End search">
               <XIcon size="1.25em" />
            </Button>
         </div>
      </div>
   {:else}
      <div class="rounded-field flex flex-grow items-center pl-2">
         {#if note}
            <Breadcrumbs noteId={note.id} />
         {/if}
         <button
            class="flex-grow cursor-text p-2 text-left"
            onclick={() => {
               startSearch();
            }}>
            {#if note}
               {note?.title}
            {:else}
               Inicio
            {/if}
         </button>
         <div class="flex items-center">
            {#if note}
               <MoreButton noteId={note.id} />
            {/if}
         </div>
      </div>
   {/if}
</div>
