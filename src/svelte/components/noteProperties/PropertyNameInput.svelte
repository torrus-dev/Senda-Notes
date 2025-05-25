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
let showDuplicateWarning: boolean = $state(false);

// Estado derivado
let suggestedGlobalProperties: GlobalProperty[] = $derived(
   globalPropertyController.getGlobalPropertiesSuggestions(newName, noteId),
);

let globalPropertySuggestionList = $derived(
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

// Funciones principales
function cancelNameInput() {
   newName = initialPropertyName;
   showSuggestions = false;
   workspace.stopPropertyEdit();
}

function selectGlobalProperty(property: GlobalProperty) {
   if (isDuplicate) {
      showDuplicateWarning = true;
   } else {
      onSelectGlobalProperty(property);
      newName = property.name;
      showSuggestions = false;
      // Mantener el foco en el input
      inputElement?.focus();
   }
}

function confirmName() {
   if (newName.trim() !== "" && newName !== initialPropertyName) {
      if (isDuplicate) {
         showDuplicateWarning = true;
      } else {
         onNameChange(newName);
         showSuggestions = false;
      }
   } else {
      cancelNameInput();
   }
}

// Manejar eventos especiales del input
function handleKeyDown(event: KeyboardEvent) {
   if (showDuplicateWarning) {
      showDuplicateWarning = false;
   }
   if (event.key === "Enter") {
      // Comprobar si existe una propiedad global con ese nombre exacto
      const globalProperty =
         globalPropertyController.getGlobalPropertyByName(newName);
      if (globalProperty) {
         selectGlobalProperty(globalProperty);
      } else {
         confirmName();
      }

      // Si hay sugerencias, Suggestions.svelte manejará el Enter
   } else if (event.key === "Escape") {
      if (!mouseInSuggestions) {
         cancelNameInput();
      }
      // Si hay selección activa, Suggestions.svelte manejará el Escape
   }
}

// Al principio seleccionamos el contenido del input
onMount(() => {
   tick().then(() => {
      if (inputElement) {
         inputElement.select();
      }
   });
});
</script>

<div
   class="property-name-input"
   use:onOutsideOrEsc={{
      // ESC ya lo gestionamos con handleKeyDown
      preventOnEsc: true,
      action: () => {
         confirmName();
      },
   }}>
   <input
      type="text"
      bind:value={newName}
      bind:this={inputElement}
      onblur={(event) => {
         if (!mouseInSuggestions) {
            confirmName();
            event.preventDefault();
         }
      }}
      onfocus={() => {
         showSuggestions = true;
      }}
      onkeydown={handleKeyDown}
      class="w-full overflow-clip px-2 py-1 text-left focus:outline-none"
      placeholder="Enter property name" />

   <Popover
      isOpen={showDuplicateWarning}
      htmlElement={inputElement}
      placement="bottom"
      alignment="start">
      <p
         class="text-content bg-error-bg rounded-field flex items-center p-2"
         use:onOutsideOrEsc={{
            action: () => {
               showDuplicateWarning = false;
            },
         }}>
         Propiedad ya existe en la nota
      </p>
   </Popover>

   <Suggestions
      bind:isOpen={showSuggestions}
      inputElement={inputElement}
      bind:mouseInSuggestions={mouseInSuggestions}
      suggestionList={globalPropertySuggestionList} />
</div>
