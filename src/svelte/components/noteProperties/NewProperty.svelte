<script lang="ts">
import type { Note } from "@projectTypes/core/noteTypes";
import type { GlobalProperty } from "@domain/entities/GlobalProperty";

import { notePropertyController } from "@controllers/property/notePropertyController.svelte";
import PropertyIcon from "@components/noteProperties/PropertyIcon.svelte";
import PropertyNameInput from "@components/noteProperties/PropertyNameInput.svelte";
import { propertyEditorController } from "@controllers/ui/propertyEditorController.svelte";

let { noteId }: { noteId: Note["id"] } = $props();

const newPropertyType = "text";

// Funciones para añadir propiedades con el componente PropertyNameInput
function createPropertyFromName(propertyName: string) {
   notePropertyController.handleCreateNoteProperty(
      noteId,
      propertyName,
      newPropertyType,
   );
   propertyEditorController.stop();
}
function createPropertyFromGlobal(globalProperty: GlobalProperty) {
   notePropertyController.handleCreateNoteProperty(
      noteId,
      globalProperty.name,
      globalProperty.type,
   );
   propertyEditorController.stop();
}
let newPropertyElement: HTMLElement | undefined = $state(undefined);
</script>

<div
   bind:this={newPropertyElement}
   class="flex w-[12rem] items-center gap-0.5 p-2">
   <PropertyIcon propertyType={newPropertyType} />
   <PropertyNameInput
      onNameChange={createPropertyFromName}
      onSelectGlobalProperty={createPropertyFromGlobal}
      noteId={noteId} />
</div>
