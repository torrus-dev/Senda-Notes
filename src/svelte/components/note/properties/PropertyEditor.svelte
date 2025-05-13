<style>
</style>

<script lang="ts">
import type { Property } from "@projectTypes/propertyTypes";
import { workspace } from "@controllers/workspaceController.svelte";
import { notePropertyController } from "@controllers/note/property/notePropertyController.svelte";
import { onOutsideOrEsc } from "@directives/onOutsideOrEsc";
import { getPropertyIcon, getPropertyTypes } from "@utils/propertyUtils";

let {
   property = undefined,
   noteId,
}: { property?: Property | undefined; noteId: string } = $props();

const propertyId = property ? property.id : undefined;
const propertyName = property ? property.name : "";
const propertyType = property ? property.type : "text";

const propertyTypes = getPropertyTypes();
let propertyNameElement: HTMLInputElement | undefined = $state(undefined);

let newPropertyName: string = $state(propertyName);
let newPropertyType: Property["type"] = $state(propertyType);

function handleSave() {
   if (newPropertyName.trim() === "") return;
   console.log("newPropertyName", newPropertyName);

   if (propertyId) {
      // update note property
      if (newPropertyName !== propertyName) {
         notePropertyController.renameNoteProperty(
            noteId,
            propertyId,
            newPropertyName,
         );
      }
      if (newPropertyType !== propertyType) {
         notePropertyController.changeNotePropertyType(
            noteId,
            propertyId,
            newPropertyType,
         );
      }
   } else {
      // create note property
      notePropertyController.createProperty(
         noteId,
         newPropertyName,
         newPropertyType,
      );
   }
}

function closeEditor() {
   handleSave();
   workspace.closePropertyEditor();
}
</script>

<div
   class="property-editor rounded-box bordered absolute top-full left-0 z-30 mt-1 flex flex-col gap-2 bg-(--color-base-200) px-4 py-2 shadow-lg"
   use:onOutsideOrEsc={{
      action: closeEditor,
   }}
   onkeydown={(event) => {
      if (event.key === "Enter") {
         closeEditor();
      }
   }}
   role="menu"
   tabindex="-1">
   <div class="form-group">
      <label class="inline-block w-[5rem]" for="name"> Name </label>
      <input
         name="name"
         type="text"
         class="bg-base-100 p-1"
         bind:value={newPropertyName}
         bind:this={propertyNameElement}
         placeholder="Enter property name" />
   </div>
   <div>
      <label for="type" class="inline-block w-[5rem]">Type</label>
      <select
         class="bg-base-100 rounded-field p-1"
         name="type"
         oninput={() => handleSave()}
         bind:value={newPropertyType}>
         {#each propertyTypes as { value, label }}
            {@const TypeIcon = getPropertyIcon(value)}
            <option value={value}>
               <TypeIcon size="1.0625em" />
               {label}
            </option>
         {/each}
      </select>
   </div>
</div>
