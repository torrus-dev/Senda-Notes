<script lang="ts">
import { noteController } from "@controllers/notes/noteController.svelte";
import { sanitizeTitle } from "@utils/noteUtils";
import { tick } from "svelte";
import Popover from "@components/floating/Popover.svelte";

// Props
let {
   noteId,
   noteTitle,
   isEditing = $bindable(false),
   autoEditOnClick = false,
   id,
   class: userClass = "",
}: {
   noteId: string;
   noteTitle: string;
   isEditing?: boolean;
   autoEditOnClick?: boolean;
   id?: string;
   class?: string;
} = $props();

// Referencias y estado local
let inputElement: HTMLInputElement | undefined = $state(undefined);
let currentTitle = $state(noteTitle);
let hasForbiddenChar = $state(false);

// Estado de edición derivado (combina prop externa con estado interno)
let editingState = $derived(isEditing);

// Manejadores de eventos
function startEditing() {
   if (!autoEditOnClick) return;
   isEditing = true;
}

function saveTitle() {
   if (hasForbiddenChar) return;

   const newTitle = sanitizeTitle(currentTitle);

   if (newTitle && newTitle.trim() !== "") {
      noteController.updateNoteTitle(noteId, newTitle);
   } else {
      // Restaurar el título original si está vacío
      currentTitle = noteTitle;
   }

   isEditing = false;
}

function cancelEditing() {
   // Restaurar el título original
   currentTitle = noteTitle;
   isEditing = false;
}

function handleKeydown(event: KeyboardEvent) {
   if (event.key === "Escape") {
      cancelEditing();
   } else if (event.key === "Enter") {
      saveTitle();
   }
}

// Verificar caracteres prohibidos cuando cambia el valor
$effect(() => {
   hasForbiddenChar = currentTitle.includes("/");
});

// Sincronizar el título cuando cambia externamente
$effect(() => {
   currentTitle = noteTitle;
});

// Manejar el enfoque y selección cuando se activa la edición
$effect(() => {
   if (editingState && inputElement) {
      tick().then(() => {
         if (inputElement) {
            inputElement.focus();
            inputElement.select(); // Seleccionar todo el texto automáticamente
         }
      });
   }
});
</script>

{#if editingState}
   <input
      bind:this={inputElement}
      bind:value={currentTitle}
      type="text"
      id={id}
      class="{userClass} w-full outline-none"
      onblur={saveTitle}
      onkeydown={handleKeydown} />

   {#if inputElement}
      <!-- Avisar que no puede contener "/" -->
      <Popover
         isOpen={hasForbiddenChar}
         class="bg-error-bg p-1"
         htmlElement={inputElement}
         placement="bottom"
         alignment="center">
         Note title cannot contain "/"
      </Popover>
   {/if}
{:else if autoEditOnClick}
   <!-- modo vista con activación por click -->
   <button
      id={id}
      type="button"
      class="{userClass} w-full cursor-pointer border-none bg-transparent p-0 text-left"
      onclick={startEditing}
      tabindex={0}>
      {noteTitle}
   </button>
{:else}
   <!-- modo vista sin auto activación -->
   <div id={id} class="{userClass} w-full text-left">
      {noteTitle}
   </div>
{/if}
