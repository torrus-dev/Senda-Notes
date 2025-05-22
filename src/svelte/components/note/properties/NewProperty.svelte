<script lang="ts">
import PropertyIcon from "@components/note/properties//PropertyIcon.svelte";

import type { Note } from "@projectTypes/noteTypes";
import type { GlobalProperty } from "@projectTypes/propertyTypes";

import PropertyNameInput from "@components/note/properties/PropertyNameInput.svelte";
import { notePropertyController } from "@controllers/note/property/notePropertyController.svelte";
import { workspace } from "@controllers/workspaceController.svelte";
import { onOutsideOrEsc } from "@directives/onOutsideOrEsc";

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
let newPropertyElement: HTMLElement | undefined = $state(undefined);
</script>

<div
   bind:this={newPropertyElement}
   class="w[12rem] flex items-center gap-0.5"
   use:onOutsideOrEsc={{
      action: () => {
         workspace.stopPropertyEdit();
      },
      triggerElement: newPropertyElement,
   }}>
   <PropertyIcon propertyType={newPropertyType} />
   <PropertyNameInput
      onNameChange={createPropertyFromName}
      onSelectGlobalProperty={createPropertyFromGlobal}
      noteId={noteId} />
</div>
