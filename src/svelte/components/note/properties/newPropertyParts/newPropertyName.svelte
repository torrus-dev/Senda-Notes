<script lang="ts">
import Popover from "@components/floating/popover/Popover.svelte";
import Button from "@components/utils/Button.svelte";
import { globalPropertyController } from "@controllers/note/property/globalPropertyController.svelte";
import type { GlobalProperty, Property } from "@projectTypes/propertyTypes";
import { getPropertyIcon } from "@utils/propertyUtils";

let {
   onselectGlobalProperty,
   onSetName,
   cancelAddProperty,
}: {
   onselectGlobalProperty: (globalProperty: GlobalProperty) => void;
   onSetName: () => void;
   cancelAddProperty: () => void;
} = $props();

let newName: Property["name"] = $state("");
let inputElement: HTMLInputElement | undefined = $state(undefined);

let isFocused: boolean = $state(false);
let isSelectingFromSuggestions: boolean = $state(false);
let suggestedGlobalProperties: GlobalProperty[] = $derived(
   globalPropertyController.searchGlobalProperties(newName),
);
let showSuggestedGlobalProps = $derived(
   isFocused && suggestedGlobalProperties.length > 0,
);

// Índice para la navegación con teclado
let selectedIndex: number = $state(-1);

// Resetea el índice cuando cambian las sugerencias
$effect(() => {
   if (suggestedGlobalProperties) {
      selectedIndex = -1;
   }
});

// Función para seleccionar una propiedad global
function selectGlobalProperty(property: GlobalProperty) {
   onselectGlobalProperty(property);
   newName = property.name;
   // Mantener el foco en el input
   inputElement?.focus();
}

function handleNameChange() {
   if (newName.trim() !== "") {
      onSetName();
   }
}

// Manejar la navegación con teclado
function handleKeyDown(event: KeyboardEvent) {
   if (!showSuggestedGlobalProps) return;

   if (event.key === "ArrowDown") {
      event.preventDefault(); // Evitar que el cursor se mueva en el input
      selectedIndex = Math.min(
         selectedIndex + 1,
         suggestedGlobalProperties.length - 1,
      );
   } else if (event.key === "ArrowUp") {
      event.preventDefault(); // Evitar que el cursor se mueva en el input
      selectedIndex = Math.max(selectedIndex - 1, -1);
   } else if (event.key === "Enter") {
      if (
         selectedIndex >= 0 &&
         selectedIndex < suggestedGlobalProperties.length
      ) {
         // Si hay una sugerencia seleccionada, usarla
         event.preventDefault();
         selectGlobalProperty(suggestedGlobalProperties[selectedIndex]);
      } else {
         // Comprobar si existe una propiedad global con ese nombre exacto
         const globalProperty =
            globalPropertyController.getGlobalPropertyByName(newName);
         if (globalProperty) {
            event.preventDefault();
            selectGlobalProperty(globalProperty);
         } else {
            // Si no hay coincidencia exacta, aplicar el cambio de nombre
            handleNameChange();
         }
      }
      isFocused = false;
   } else if (event.key === "Escape") {
      // Si hay una selección activa, primero la reseteamos
      if (selectedIndex >= 0) {
         selectedIndex = -1;
      }
      // Cancelamos
      cancelAddProperty();
   }
}
</script>

<input
   type="text"
   bind:value={newName}
   bind:this={inputElement}
   onblur={() => {
      if (!isSelectingFromSuggestions) {
         handleNameChange();
         isFocused = false;
      }
   }}
   onfocus={() => {
      isFocused = true;
   }}
   onkeydown={handleKeyDown}
   class="w-full overflow-clip p-0.5 text-left focus:outline-none" />

<Popover
   isOpen={showSuggestedGlobalProps}
   htmlElement={inputElement}
   placement="bottom"
   alignment="start"
   class="bg-base-200 max-h-48 overflow-y-auto">
   <ul
      class="flex-col p-1"
      onmouseenter={() => {
         isSelectingFromSuggestions = true;
      }}
      onmouseleave={() => {
         isSelectingFromSuggestions = false;
      }}>
      {#each suggestedGlobalProperties as globalProperty, index}
         {@const TypeIcon = getPropertyIcon(globalProperty.type)}
         <li>
            <Button
               class="w-full justify-start 
                  {selectedIndex === index ? 'bg-interactive-focus' : ''}"
               onclick={(event) => {
                  event.preventDefault();
                  selectGlobalProperty(globalProperty);
               }}>
               <TypeIcon size="1.125em" class="mr-2" />
               <span>{globalProperty.name}</span>
            </Button>
         </li>
      {/each}
   </ul>
</Popover>
