<script lang="ts">
import type { Note } from "@projectTypes/noteTypes";
import type { GlobalProperty } from "@projectTypes/propertyTypes";

import { notePropertyController } from "@controllers/note/property/notePropertyController.svelte";
import { workspace } from "@controllers/workspaceController.svelte";
import PropertyIcon from "@components/note/properties//PropertyIcon.svelte";
import PropertyNameInput from "@components/note/properties/PropertyNameInput.svelte";

let { noteId }: { noteId: Note["id"] } = $props();

const newPropertyType = "text";

// Funciones para añadir propiedades con el componente PropertyNameInput
function createPropertyFromName(propertyName: string) {
   notePropertyController.handleCreateNoteProperty(
      noteId,
      propertyName,
      newPropertyType,
   );
   workspace.stopPropertyEdit();
}
function createPropertyFromGlobal(globalProperty: GlobalProperty) {
   notePropertyController.handleCreateNoteProperty(
      noteId,
      globalProperty.name,
      globalProperty.type,
   );
   workspace.stopPropertyEdit();
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
