<script lang="ts">
import Popover from "@components/floating/popover/Popover.svelte";
import Button from "@components/utils/Button.svelte";
import { globalPropertyController } from "@controllers/note/property/globalPropertyController.svelte";
import type { GlobalProperty, Property } from "@projectTypes/propertyTypes";
import { getPropertyIcon } from "@utils/propertyUtils";

let {
   savedPropertyName = "",
   onselectGlobalProperty,
   onnameChange,
}: {
   savedPropertyName?: Property["name"];
   onselectGlobalProperty: () => void;
   onnameChange: () => void;
} = $props();

let newTitle: Property["name"] = $state(savedPropertyName);
let inputElement: HTMLInputElement | undefined = $state(undefined);

let isFocused: boolean = $state(false);
let suggestedGlobalProperties: GlobalProperty[] = $derived(
   globalPropertyController.searchGlobalProperties(newTitle),
);
let showSuggestedGlobalProps = $derived(
   isFocused && suggestedGlobalProperties.length > 0,
);
</script>

<input
   type="text"
   bind:value={newTitle}
   bind:this={inputElement}
   onblur={() => {
      if (newTitle.trim() !== "") {
         onnameChange();
      }
      isFocused = false;
   }}
   onfocus={() => {
      isFocused = true;
   }}
   onkeydown={(event: KeyboardEvent) => {
      if (event.key === "Enter") {
         // check for global property with that name first, and trigger "onselectGlobalProperty" instead of "onnameChange"
         (event.target as HTMLInputElement).blur();
      }
      if (event.key === "Escape") {
         // Cancelamos y restauramos el titulo guardado
         newTitle = savedPropertyName;
      }
   }}
   class="w-full overflow-clip p-0.5 text-left focus:outline-none" />

<Popover
   isOpen={showSuggestedGlobalProps}
   htmlElement={inputElement}
   placement="bottom"
   alignment="start"
   class="bg-base-200 ">
   <ul class="flex-col p-1">
      {#each suggestedGlobalProperties as globalProperty}
         {@const TypeIcon = getPropertyIcon(globalProperty.type)}
         <li>
            <Button class="w-full">
               <TypeIcon size="1.125em" />
               {globalProperty.name}
            </Button>
         </li>
      {/each}
   </ul>
</Popover>
