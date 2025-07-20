<script lang="ts">
import { globalPropertyController } from "@controllers/property/globalPropertyController.svelte";
import { onClickOutside } from "@directives/onClickOutside";
import { GlobalProperty } from "@domain/entities/GlobalProperty";
import type { NoteProperty } from "@domain/entities/NoteProperty";

import { onMount, tick } from "svelte";

let {
   globalProperty,
   isRenaming = $bindable(),
}: {
   globalProperty: GlobalProperty;
   isRenaming: boolean;
} = $props();

let initialPropertyName = globalProperty ? globalProperty.name : "";
let newName: NoteProperty["name"] = $state(initialPropertyName);
let inputElement: HTMLInputElement | undefined = $state(undefined);

// Funciones principales
function cancelNameInput() {
   newName = initialPropertyName;
   isRenaming = false;
}

function confirmNameChange() {
   if (newName.trim() !== "" && newName !== initialPropertyName) {
      globalPropertyController.renameGlobalProperty(globalProperty.id, newName);
      isRenaming = false;
   } else {
      cancelNameInput();
   }
}

// Manejar eventos especiales del input
function handleKeyDown(event: KeyboardEvent) {
   if (event.key === "Enter") {
      confirmNameChange();
   } else if (event.key === "Escape") {
      cancelNameInput();
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

<input
   type="text"
   bind:value={newName}
   bind:this={inputElement}
   onblur={(event) => {
      confirmNameChange();
      event.preventDefault();
   }}
   use:onClickOutside={{
      action: () => {
         confirmNameChange();
      },
   }}
   onkeydown={handleKeyDown}
   class="w-full overflow-clip text-left focus:outline-none"
   placeholder="Enter property name" />
