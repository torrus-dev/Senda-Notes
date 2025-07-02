<script lang="ts">
import Button from "@components/utils/Button.svelte";
import Popover from "@components/floating/Popover.svelte";
import { TextIcon } from "lucide-svelte";

interface suggestion {
   icon?: typeof TextIcon;
   label: string;
   onSelect: () => void;
}

let {
   isOpen = $bindable(),
   inputElement,
   mouseInSuggestions = $bindable(),
   suggestionList = [],
}: {
   isOpen: boolean;
   inputElement: HTMLInputElement | undefined;
   mouseInSuggestions: boolean;
   suggestionList: suggestion[];
} = $props();

let showSuggestions = $derived(isOpen && suggestionList.length > 0);

// Índice para la navegación con teclado
let selectedIndex: number = $state(-1);
let selectedSuggestion: suggestion | undefined = $derived(
   selectedIndex >= 0 && selectedIndex < suggestionList.length
      ? suggestionList[selectedIndex]
      : undefined,
);

// Resetea el índice de teclado cuando cambia el prop suggestionList
$effect(() => {
   if (suggestionList) {
      selectedIndex = -1;
   }
});

// Agregar event listener para el teclado
$effect(() => {
   if (inputElement && showSuggestions) {
      inputElement.addEventListener("keydown", handleKeyDown);

      return () => {
         inputElement.removeEventListener("keydown", handleKeyDown);
      };
   }
});

function handleKeyDown(event: KeyboardEvent) {
   if (!(showSuggestions && inputElement)) return;

   if (event.key === "ArrowDown") {
      event.preventDefault(); // Evitar que el cursor se mueva en el input
      selectedIndex = Math.min(selectedIndex + 1, suggestionList.length - 1);
   } else if (event.key === "ArrowUp") {
      event.preventDefault(); // Evitar que el cursor se mueva en el input
      selectedIndex = Math.max(selectedIndex - 1, -1);
   } else if (event.key === "Enter") {
      if (selectedSuggestion) {
         event.preventDefault();
         event.stopPropagation();
         selectedSuggestion.onSelect();
         isOpen = false; // Cerrar las sugerencias después de seleccionar
      }
   } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      // Reseteamos selección
      selectedIndex = -1;

      isOpen = false;
   }
}

function handleSuggestionClick(
   event: Event,
   suggestionItem: suggestion,
   index: number,
) {
   suggestionItem.onSelect();
   isOpen = false; // Cerrar las sugerencias después de seleccionar
   event.preventDefault();
   event.stopPropagation();
}

function handleMouseEnter(index: number) {
   selectedIndex = index; // Sincronizar la selección visual con el mouse
}
</script>

{#if showSuggestions && inputElement}
   <Popover
      isOpen={true}
      htmlElement={inputElement}
      placement="bottom"
      alignment="start"
      class="bg-base-200 bordered z-40 max-h-48 overflow-y-auto shadow-xl">
      <ul
         onmouseenter={() => {
            mouseInSuggestions = true;
         }}
         onmouseleave={() => {
            mouseInSuggestions = false;
         }}>
         {#each suggestionList as suggestionItem, index}
            <li class="w-full">
               <Button
                  onclick={(event) => {
                     handleSuggestionClick(event, suggestionItem, index);
                     event.preventDefault();
                     event.stopPropagation();
                  }}
                  onmouseenter={() => handleMouseEnter(index)}
                  class="{index === selectedIndex
                     ? 'bg-interactive-focus'
                     : ''} w-full">
                  {#if suggestionItem.icon}
                     <suggestionItem.icon size="1.125em" />
                  {/if}
                  {suggestionItem.label}
               </Button>
            </li>
         {/each}
         <div>
            <p>
               <kbd>ENTER</kbd> para abrir
            </p>
            <p>
               <kbd>CTRL + ENTER</kbd> para abrir en nueva pestaña
            </p>
            <p>
               <kbd>SHIFT + ENTER</kbd> para crear
            </p>
            <p>
               <kbd>ESC</kbd> para salir
            </p>
         </div>
      </ul>
   </Popover>
{/if}
