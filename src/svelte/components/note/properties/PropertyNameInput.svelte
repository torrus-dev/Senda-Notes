<script lang="ts">
import Suggestions from "@components/floating/Suggestions.svelte";
import { globalPropertyController } from "@controllers/note/property/globalPropertyController.svelte";
import type { Note } from "@projectTypes/noteTypes";
import type { GlobalProperty, NoteProperty } from "@projectTypes/propertyTypes";
import { getPropertyIcon } from "@utils/propertyUtils";
import { onMount, tick } from "svelte";

let {
   initialPropertyName = "",
   onNameChange,
   onSelectGlobalProperty,
   noteId,
}: {
   initialPropertyName?: NoteProperty["name"];
   onNameChange: (newName: string) => void;
   onSelectGlobalProperty: (globalProperty: GlobalProperty) => void;
   noteId?: Note["id"];
} = $props();

let newName: NoteProperty["name"] = $state(initialPropertyName);
let inputElement: HTMLInputElement | undefined = $state(undefined);
let isFocused: boolean = $state(false);
let mouseInSuggestions: boolean = $state(false);

let suggestedGlobalProperties: GlobalProperty[] = $derived(
   globalPropertyController.getGlobalPropertiesSuggestions(newName, noteId),
);

// Convertir las propiedades globales al formato que espera Suggestions
let suggestionList = $derived(
   suggestedGlobalProperties.map((globalProperty) => ({
      icon: getPropertyIcon(globalProperty.type),
      label: globalProperty.name,
      onSelect: () => selectGlobalProperty(globalProperty),
   })),
);

// Función para seleccionar una propiedad global
function selectGlobalProperty(property: GlobalProperty) {
   onSelectGlobalProperty(property);
   newName = property.name;
   isFocused = false;
   // Mantener el foco en el input
   inputElement?.focus();
}

function handleNameChange() {
   if (newName.trim() !== "") {
      onNameChange(newName);
   }
}

// Manejar eventos especiales del input
function handleKeyDown(event: KeyboardEvent) {
   if (event.key === "Enter") {
      // Si no hay sugerencias visibles o ninguna seleccionada
      if (!isFocused || suggestionList.length === 0) {
         // Comprobar si existe una propiedad global con ese nombre exacto
         const globalProperty =
            globalPropertyController.getGlobalPropertyByName(newName);
         if (globalProperty) {
            event.preventDefault();
            selectGlobalProperty(globalProperty);
         } else {
            // Si no hay coincidencia exacta, aplicar el cambio de nombre
            handleNameChange();
            isFocused = false;
         }
      }
      // Si hay sugerencias, Suggestions.svelte manejará el Enter
   } else if (event.key === "Escape") {
      // Restaurar el nombre original si no hay selección activa en sugerencias
      if (!mouseInSuggestions) {
         newName = initialPropertyName;
         isFocused = false;
      }
      // Si hay selección activa, Suggestions.svelte manejará el Escape
   }
}

// Al crear al componente enfocamos el cursor en el elemento input
onMount(() => {
   tick().then(() => {
      if (inputElement) {
         inputElement.focus();
      }
   });
});
</script>

<div class="property-name-input">
   <input
      type="text"
      bind:value={newName}
      bind:this={inputElement}
      onblur={() => {
         if (!mouseInSuggestions) {
            handleNameChange();
            isFocused = false;
         }
      }}
      onfocus={() => {
         isFocused = true;
      }}
      onkeydown={handleKeyDown}
      class="w-full overflow-clip px-2 py-1 text-left focus:outline-none"
      placeholder="Enter property name" />

   <Suggestions
      bind:isOpen={isFocused}
      inputElement={inputElement}
      bind:mouseInSuggestions={mouseInSuggestions}
      suggestionList={suggestionList} />
</div>
