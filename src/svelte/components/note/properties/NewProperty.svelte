<script lang="ts">
import PropertyIcon from "@components/note/properties//PropertyIcon.svelte";

import type { Note } from "@projectTypes/noteTypes";
import type { GlobalProperty } from "@projectTypes/propertyTypes";

import PropertyNameInput from "@components/note/properties/PropertyNameInput.svelte";
import { notePropertyController } from "@controllers/note/property/notePropertyController.svelte";
import { workspace } from "@controllers/workspaceController.svelte";

let { noteId }: { noteId: Note["id"] } = $props();

const newPropertyType = "text";

function createPropertyFromName(propertyname: string) {
   notePropertyController.handleCreateNoteProperty(
      noteId,
      propertyname,
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
</script>

<div class="grid grid-cols-[12rem_auto] gap-0.5">
   <PropertyIcon propertyType={newPropertyType} />
   <!-- HACER QUE FUNCIONE ESTO DE ABAJO -->
   <PropertyNameInput
      onchange={createPropertyFromName}
      onSelectGlobalProperty={createPropertyFromGlobal}
      noteId={noteId} />
</div>
