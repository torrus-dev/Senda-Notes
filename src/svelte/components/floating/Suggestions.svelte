<script lang="ts">
import Button from "@components/utils/Button.svelte";
import Popover from "./Popover.svelte";
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
   inputElement: HTMLInputElement;
   mouseInSuggestions: boolean;
   suggestionList: suggestion[];
} = $props();

let showSuggestions = $derived(
   isOpen && suggestionList.length > 0 && inputElement,
);

// Índice para la navegación con teclado
let selectedIndex: number = $state(-1);
let selectedSuggestion: suggestion | undefined = $derived(
   selectedIndex >= 0 && selectedIndex < suggestionList.length
      ? suggestionList[selectedIndex]
      : undefined,
);

// Resetea el índice cuando cambian las sugerencias
$effect(() => {
   if (suggestionList) {
      selectedIndex = -1;
   }
});

function handleKeyDown(event: KeyboardEvent) {
   if (!showSuggestions) return;

   if (event.key === "ArrowDown") {
      event.preventDefault(); // Evitar que el cursor se mueva en el input
      selectedIndex = Math.min(selectedIndex + 1, suggestionList.length - 1);
   } else if (event.key === "ArrowUp") {
      event.preventDefault(); // Evitar que el cursor se mueva en el input
      selectedIndex = Math.max(selectedIndex - 1, -1);
   } else if (event.key === "Enter") {
      if (selectedSuggestion) {
         selectedSuggestion.onSelect();
      }
   } else if (event.key === "Escape") {
      // Si hay una selección activa, la reseteamos
      if (selectedIndex >= 0) {
         selectedIndex = -1;
      } else {
         // Restauramos el nombre original de la propiedad
         isOpen = false;
      }
   }
}
</script>

{#if showSuggestions}
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
            <li>
               <Button
                  onclick={(event) => {
                     suggestionItem.onSelect();
                     selectedIndex = index;
                     event.preventDefault();
                     event.stopPropagation();
                  }}
                  class={index === selectedIndex ? "bg-interactive-focus" : ""}>
                  {#if suggestionItem.icon}
                     <suggestionItem.icon size="1.125em" />
                  {/if}
                  {suggestionItem.label}
               </Button>
            </li>
         {/each}
      </ul>
   </Popover>
{/if}
