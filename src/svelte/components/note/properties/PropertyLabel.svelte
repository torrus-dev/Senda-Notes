<script lang="ts">
import PropertyRenameInput from "@components/note/properties/PropertyRenameInput.svelte";
import PropertyIcon from "./PropertyIcon.svelte";

import { notePropertyController } from "@controllers/note/property/notePropertyController.svelte";

import { TextCursorInputIcon, Trash2Icon } from "lucide-svelte";

import type { Note } from "@projectTypes/noteTypes";
import type { GlobalProperty, Property } from "@projectTypes/propertyTypes";
import type { MenuItem } from "@projectTypes/editorMenuTypes";
import {
   contextMenu,
   dropdownMenu,
} from "@directives/floatingMenuDirective.svelte";
import Button from "@components/utils/Button.svelte";

let {
   noteId,
   property,
   handleDragStart,
   handleDragEnd,
}: {
   noteId: Note["id"];
   property: Property;
   handleDragStart: (event: DragEvent) => void;
   handleDragEnd: (event: DragEvent) => void;
} = $props();

const labelMenuItems: MenuItem[] = [
   {
      type: "action",
      label: "Rename Property",
      icon: TextCursorInputIcon,
      action: () => {
         // rename
      },
   },
   {
      type: "action",
      label: "Delete Property",
      icon: Trash2Icon,
      action: () => {
         notePropertyController.deleteProperty(noteId, property.id);
         // close
      },
      class: "text-error",
   },
];

function selectGlobalProperty(globalProperty: GlobalProperty) {
   console.log("ejecutando selectGlobalProperty");
}

function nameChange() {
   console.log("ejecutando nameChange");
}

let isRenamingLabel = $state(false);
</script>

<div
   draggable="true"
   role="listitem"
   class="flex w-full items-center"
   ondragstart={handleDragStart}
   ondragend={handleDragEnd}>
   <Button dropdownMenuItems={labelMenuItems} class="w-full">
      <PropertyIcon propertyType={property.type} />

      {#if isRenamingLabel}
         <PropertyRenameInput
            savedPropertyName={property.name}
            onselectGlobalProperty={selectGlobalProperty}
            onnameChange={nameChange} />
      {:else}
         {property.name}
      {/if}
   </Button>
</div>
