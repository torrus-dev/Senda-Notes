<script lang="ts">
import Popover from "./Popover.svelte";

interface suggestion {
   label: string;
   onSelect: () => void;
}

let {
   inputElement,
   mouseInSuggestions = $bindable(),
   suggestionList = [],
}: {
   inputElement: HTMLInputElement;
   mouseInSuggestions: boolean;
   suggestionList: suggestion[];
} = $props();

// Índice para la navegación con teclado
let selectedIndex: number = $state(-1);
</script>

{#if suggestionList.length > 0 && inputElement}
   <Popover
      isOpen={true}
      htmlElement={inputElement}
      placement="bottom"
      alignment="start"
      class="bg-base-200 bordered z-40 max-h-48 overflow-y-auto shadow-xl">
      <ul>
         {#each suggestionList as suggestionItem, index}
            <li>
               <Button>
                  {suggestionItem.label}
               </Button>
            </li>
         {/each}
      </ul>
   </Popover>
{/if}
