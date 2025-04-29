<script lang="ts">
import { noteController } from "@controllers/note/noteController.svelte";
import { sanitizeTitle } from "@utils/noteUtils";
import { tick } from "svelte";
import Popover from "@components/floating/popover/Popover.svelte";

// Props
let {
   noteId,
   noteTitle,
   class: userClass = "",
   isEditing = false,
   onEditComplete = () => {}, // Callback opcional cuando se completa la edición
}: {
   noteId: string;
   noteTitle: string;
   class?: string;
   isEditing: boolean;
   onEditComplete: () => void;
} = $props();

// Referencias y estado local
let inputElement: HTMLInputElement | undefined = $state(undefined);
let currentTitle = $state(noteTitle);
let hasForbiddenChar = $state(false);

// Manejadores de eventos
function saveTitle() {
   const newTitle = sanitizeTitle(currentTitle);

   if (newTitle && newTitle.trim() !== "") {
      noteController.updateNoteTitle(noteId, newTitle);
   } else {
      // Restaurar el título original si está vacío
      currentTitle = noteTitle;
   }

   onEditComplete();
}

function handleKeydown(event: KeyboardEvent) {
   if (event.key === "Escape") {
      // Cancelar edición
      currentTitle = noteTitle;
      onEditComplete();
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

$effect(() => {
   if (isEditing) {
      tick().then(() => {
         if (inputElement) {
            inputElement.focus();
         }
      });
   }
});
</script>

{#if isEditing}
   <input
      bind:this={inputElement}
      bind:value={currentTitle}
      type="text"
      class="{userClass} w-full underline outline-none"
      onblur={saveTitle}
      onkeydown={handleKeydown} />

   {#if inputElement}
      <Popover
         isOpen={hasForbiddenChar}
         class="bg-error-bg p-1"
         htmlElement={inputElement}
         placement="bottom">
         Note title cannot contain "/"
      </Popover>
   {/if}
{:else}
   <div class="{userClass} w-full text-left">
      {noteTitle}
   </div>
{/if}
