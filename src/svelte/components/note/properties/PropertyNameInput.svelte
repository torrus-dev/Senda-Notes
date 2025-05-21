<script lang="ts">
import Popover from "@components/floating/popover/Popover.svelte";
import Button from "@components/utils/Button.svelte";
import { globalPropertyController } from "@controllers/note/property/globalPropertyController.svelte";
import type { Note } from "@projectTypes/noteTypes";
import type { GlobalProperty, NoteProperty } from "@projectTypes/propertyTypes";
import { getPropertyIcon } from "@utils/propertyUtils";

let {
   value = "",
   onchange,
   onSelectGlobalProperty,
   noteId,
}: {
   value: NoteProperty["name"];
   onchange: (newName: string) => void;
   onSelectGlobalProperty: (globalProperty: GlobalProperty) => void;
   noteId?: Note["id"];
} = $props();

let newName: NoteProperty["name"] = $state(value);
let inputElement: HTMLInputElement | undefined = $state(undefined);
let isFocused: boolean = $state(false);
let isSelectingFromSuggestions: boolean = $state(false);

// Actualizamos el valor interno cuando cambia el prop externo
$effect(() => {
   newName = value;
});

let suggestedGlobalProperties: GlobalProperty[] = $state([]);
$effect(() => {
   if (newName && noteId) {
      suggestedGlobalProperties =
         globalPropertyController.getGlobalPropertiesSuggestions(
            newName,
            noteId,
         );
   }
});

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
   onSelectGlobalProperty(property);
   newName = property.name;
   // Mantener el foco en el input
   inputElement?.focus();
}

function handleNameChange() {
   if (newName.trim() !== "") {
      onchange(newName);
   }
}

// Manejamos el cambio de valor interno para actualizar el prop externo
$effect(() => {
   if (newName !== value && newName.trim() !== "") {
      onchange(newName);
   }
});

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
      // Restauramos el nombre original
      newName = value;
   }
}
</script>

<div class="property-name-input">
   {noteId}
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
      class="rounded-field bg-interactive-accent w-full overflow-clip px-2 py-1 text-left focus:outline-none"
      placeholder="Enter property name" />

   <Popover
      isOpen={showSuggestedGlobalProps}
      htmlElement={inputElement}
      placement="bottom"
      alignment="start"
      class="bg-base-200 bordered z-40 max-h-48 overflow-y-auto shadow-xl">
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
                               {selectedIndex === index
                     ? 'bg-interactive-focus'
                     : ''}"
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
</div>
