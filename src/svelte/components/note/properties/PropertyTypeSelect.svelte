<script lang="ts">
import Button from "@components/utils/Button.svelte";
import { onOutsideOrEsc } from "@directives/onOutsideOrEsc";
import { getPropertyIcon, getPropertyTypesList } from "@utils/propertyUtils";

export type SelectOption = {
   value: string;
   label: string;
};

// Props
let {
   options = getPropertyTypesList(),
   selectedValue = $bindable("text"),
   disabled = false,
}: {
   options?: SelectOption[];
   selectedValue: string;
   disabled?: boolean;
} = $props();

// Obtener la opción seleccionada como objeto
let selectedOption = $derived(
   options.find((opt) => opt.value === selectedValue) || options[0],
);

// Estado
let isOpen = $state(false);

// Funciones
function toggleDropdown() {
   if (disabled) return;
   isOpen = !isOpen;
}

function handleOptionClick(option: SelectOption) {
   if (disabled) return;
   selectedValue = option.value;
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
   <Button class="w-full" onclick={toggleDropdown} disabled={disabled}>
      {@const TypeIcon = getPropertyIcon(selectedValue)}
      <TypeIcon size="1.0625em" />
      {selectedOption.label}
   </Button>

   {#if isOpen}
      <ul
         id="dropdown-list"
         class="rounded-box bg-base-200 bordered absolute z-40 mt-1 w-full overflow-hidden shadow-lg"
         use:onOutsideOrEsc={{ action: () => (isOpen = false) }}
         role="listbox">
         {#each options as option (option.value)}
            {@const TypeIcon = getPropertyIcon(option.value)}
            <li
               class="hover:bg-primary/10 flex cursor-pointer items-center gap-2 px-3 py-2 text-sm
               {option.value === selectedValue ? 'bg-primary/20' : ''}"
               onclick={() => handleOptionClick(option)}
               onkeydown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                     event.preventDefault();
                     handleOptionClick(option);
                  }
               }}
               role="option"
               aria-selected={option.value === selectedValue}>
               <TypeIcon size="1.0625em" />
               {option.label}
            </li>
         {/each}
      </ul>
   {/if}
</div>
