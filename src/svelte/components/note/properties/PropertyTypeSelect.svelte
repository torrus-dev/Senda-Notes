<style></style>

<script lang="ts">
import Button from "@components/utils/Button.svelte";
import { onOutsideOrEsc } from "@directives/onOutsideOrEsc";
import { getPropertyIcon } from "@utils/propertyUtils";

export type SelectOption = {
   value: string;
   label: string;
};

// Props
let {
   options,
   selectedOption = $bindable(),
   disabled = false,
}: {
   options: SelectOption[];
   selectedOption: SelectOption;
   disabled?: boolean;
} = $props();

// Estado
let isOpen = $state(false);
let selectedIndex = $state();

// Funciones
function toggleDropdown() {
   if (disabled) return;
   isOpen = !isOpen;
}

function handleOptionClick(option: SelectOption) {
   if (disabled) return;
   selectedOption = option;
   isOpen = false;
}

function handleKeydown(event: KeyboardEvent) {
   if (disabled) return;
   if (event.key === "Escape") {
      isOpen = false;
   } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault(); // Previene scroll con espacio
      toggleDropdown();
   }
}
</script>

<div
   class="relative"
   onkeydown={handleKeydown}
   role="combobox"
   aria-expanded={isOpen}
   aria-controls="dropdown-list"
   tabindex="0"
   aria-haspopup="listbox">
   <Button>
      {selectedOption.value}
   </Button>

   {#if isOpen}
      <ul use:onOutsideOrEsc={{ action: () => toggleDropdown() }}>
         {#each options as option (option.value)}
            {@const TypeIcon = getPropertyIcon(option.value)}
            <li
               class="hover:bg-primary-focus hover:text-primary-content cursor-pointer px-3 py-2 text-sm
            {option.value === selectedOption.value ? 'highlight' : ''}"
               onclick={() => handleOptionClick(option)}
               onkeydown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                     event.preventDefault();
                     handleOptionClick(option);
                  }
               }}
               role="option"
               aria-selected={option.value === selectedOption.value}>
               <TypeIcon size="1.0625em" />
               {option.label}
            </li>
         {/each}
      </ul>
   {/if}
</div>
