<script lang="ts">
import MoreButton from "@components/navbar/MoreButton.svelte";
import Breadcrumbs from "@components/utils/Breadcrumbs.svelte";
import SearchResults from "@components/navbar/SearchResults.svelte";
import Button from "@components/utils/Button.svelte";
import { noteQueryController } from "@controllers/note/noteQueryController.svelte";
import { searchController } from "@controllers/searchController.svelte";
import { workspace } from "@controllers/workspaceController.svelte";

import type { Note } from "@projectTypes/noteTypes";
import type { SearchResult } from "@projectTypes/searchTypes";

import { tick } from "svelte";
import { DeleteIcon, XIcon } from "lucide-svelte";
import { onClickOutside } from "@directives/onClickOutside";
import { onPressEsc } from "@directives/onPressEsc";

let { note }: { note: Note | undefined } = $props();

const getNotePath = () =>
   note?.id ? noteQueryController.getPathAsString(note?.id) : "";

let searchValue: string = $state("");
let searchElement: HTMLInputElement | undefined = $state(undefined);
let searchResults: SearchResult[] = $state([]);
let isSearching = $derived(searchController.isSearching);

// Buscar cuando cambia el valor de búsqueda
$effect(() => {
   if (isSearching && searchValue.trim()) {
      searchResults = searchController.searchNotes(searchValue);
   } else {
      searchResults = [];
   }
});

// Comenzar o terminar de buscar segun el estado de isSearching en el controlador de busquedas
$effect(() => {
   if (isSearching) {
      searchValue = getNotePath();
      // Esperar a que Svelte renderice el searchElement tras un condicional para enfocarlo
      tick().then(() => {
         if (searchElement) {
            searchElement.focus();
         }
      });
   } else {
      searchValue = "";
      searchResults = [];
   }
});

// Maneja la selección de un resultado
function handleResultSelect(result: SearchResult) {
   // Navegar a la nota seleccionada
   if (result.note && result.note.id) {
      workspace.setActiveNoteId(result.note.id);
      searchController.isSearching = false;
   }
}
</script>

<div
   class="bg-base-200 rounded-field relative flex h-10 w-full justify-between
   {isSearching ? 'outline-interactive-accent-focus outline-2' : ''}">
   {#if isSearching}
      <div
         class=" rounded-field flex flex-grow pl-2.5"
         use:onPressEsc={{
            action: () => {
               searchController.isSearching = false;
            },
         }}
         use:onClickOutside={{
            action: () => {
               searchController.isSearching = false;
            },
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
            select={handleResultSelect} />
         <div class="flex items-center">
            <Button
               title="Delete search"
               onclick={() => {
                  searchValue = "";
                  searchElement?.focus();
               }}>
               <DeleteIcon size="1.25em" />
            </Button>
            <Button
               title="End search"
               onclick={() => {
                  searchController.isSearching = false;
               }}>
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
               searchController.isSearching = true;
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
