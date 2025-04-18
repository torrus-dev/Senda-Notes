<script lang="ts">
import { noteController } from "@controllers/noteController.svelte";
import { sanitizeTitle } from "@utils/noteUtils";
import { tick } from "svelte";

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

// Manejadores de eventos
function saveTitle() {
   const newTitle = sanitizeTitle(currentTitle);

   if (newTitle && newTitle.trim() !== "") {
      noteController.updateNote(noteId, { title: newTitle });
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
{:else}
   <div class="{userClass} w-full text-left">
      {noteTitle}
   </div>
{/if}
