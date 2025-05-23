<script lang="ts">
import Popover from "@components/floating/Popover.svelte";
import Suggestions from "@components/floating/Suggestions.svelte";
import { globalPropertyController } from "@controllers/note/property/globalPropertyController.svelte";
import { notePropertyController } from "@controllers/note/property/notePropertyController.svelte";
import { workspace } from "@controllers/workspaceController.svelte";
import { onOutsideOrEsc } from "@directives/onOutsideOrEsc";
import type { Note } from "@projectTypes/noteTypes";
import type { GlobalProperty, NoteProperty } from "@projectTypes/propertyTypes";
import { getPropertyIcon } from "@utils/propertyUtils";
import { onMount, tick } from "svelte";

let {
   property = undefined,
   onNameChange,
   onSelectGlobalProperty,
   noteId,
}: {
   property?: NoteProperty;
   onNameChange: (newName: string) => void;
   onSelectGlobalProperty: (globalProperty: GlobalProperty) => void;
   noteId: Note["id"];
} = $props();

let initialPropertyName = property ? property.name : "";
let newName: NoteProperty["name"] = $state(initialPropertyName);
let inputElement: HTMLInputElement | undefined = $state(undefined);
let showSuggestions: boolean = $state(false);
let mouseInSuggestions: boolean = $state(false);

let suggestedGlobalProperties: GlobalProperty[] = $derived(
   globalPropertyController.getGlobalPropertiesSuggestions(newName, noteId),
);

// Convertir las propiedades globales al formato que espera Suggestions
let suggestionList = $derived(
   suggestedGlobalProperties.map((globalProperty) => ({
      icon: getPropertyIcon(globalProperty.type),
      label: globalProperty.name,
      onSelect: () => {
         selectGlobalProperty(globalProperty);
      },
   })),
);

let isDuplicate = $derived(
   notePropertyController.isDuplicateName(noteId, newName, property?.id),
);

// Función para seleccionar una propiedad global
function selectGlobalProperty(property: GlobalProperty) {
   onSelectGlobalProperty(property);
   newName = property.name;
   showSuggestions = false;
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
   if (event.key === "Enter" && !isDuplicate) {
      // Comprobar si existe una propiedad global con ese nombre exacto
      const globalProperty =
         globalPropertyController.getGlobalPropertyByName(newName);
      if (globalProperty) {
         event.preventDefault();
         selectGlobalProperty(globalProperty);
      } else {
         // Si no hay coincidencia exacta, aplicar el cambio de nombre
         handleNameChange();
         showSuggestions = false;
      }

      // Si hay sugerencias, Suggestions.svelte manejará el Enter
   } else if (event.key === "Escape") {
      // Restaurar el nombre original si no hay selección activa en sugerencias
      if (!mouseInSuggestions) {
         newName = initialPropertyName;
         showSuggestions = false;
         workspace.stopPropertyEdit();
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

<div
   class="property-name-input"
   use:onOutsideOrEsc={{
      // como ESC ya lo gestionamos de otra forma nos encargamos de click outside
      preventOnEsc: true,
      action: () => {
         if (isDuplicate) return;
         if (newName.trim() === "" || newName === initialPropertyName) {
            // Si el nombre esta vacio o es igual paramos la edición
            workspace.stopPropertyEdit();
         } else {
            // Si no guardamos los cambios
            handleNameChange();
         }
      },
   }}>
   <input
      type="text"
      bind:value={newName}
      bind:this={inputElement}
      onblur={() => {
         if (!mouseInSuggestions && !isDuplicate) {
            handleNameChange();
            showSuggestions = false;
         }
      }}
      onfocus={() => {
         showSuggestions = true;
      }}
      onkeydown={handleKeyDown}
      class="w-full overflow-clip px-2 py-1 text-left focus:outline-none"
      placeholder="Enter property name" />
   <Popover
      isOpen={isDuplicate}
      htmlElement={inputElement}
      placement="bottom"
      alignment="start">
      <p class="text-content bg-error-bg rounded-field flex items-center p-2">
         Propiedad ya existe en la nota
      </p>
   </Popover>

   <Suggestions
      bind:isOpen={showSuggestions}
      inputElement={inputElement}
      bind:mouseInSuggestions={mouseInSuggestions}
      suggestionList={suggestionList} />
</div>
