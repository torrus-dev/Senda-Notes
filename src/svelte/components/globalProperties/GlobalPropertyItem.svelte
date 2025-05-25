<script lang="ts">
import type { GlobalProperty } from "@projectTypes/propertyTypes";
import type { MenuItem } from "@projectTypes/editorMenuTypes";
import {
   getPropertyIcon,
   getPropertyTypesList,
} from "@lib/utils/propertyUtils";
import {
   SearchIcon,
   SquarePenIcon,
   TextCursorInputIcon,
   Trash2Icon,
} from "lucide-svelte";
import Button from "@components/utils/Button.svelte";
import { globalPropertyController } from "@controllers/note/property/globalPropertyController.svelte";

let { globalProperty }: { globalProperty: GlobalProperty } = $props();

const IconComponent = $derived(getPropertyIcon(globalProperty.type));

const propertyTypesMenuItems: MenuItem[] = getPropertyTypesList().map(
   (option) => ({
      type: "action",
      label: option.label,
      icon: getPropertyIcon(option.value),
      action: () => {
         globalPropertyController.updateGlobalPropertyType(
            globalProperty.id,
            option.value,
         );
      },
   }),
);

let menuItems: MenuItem[] = [
   {
      type: "action",
      label: "Filter Notes",
      icon: SearchIcon,
      action: () => {},
   },
   {
      type: "action",
      label: "Rename Global Property",
      icon: TextCursorInputIcon,
      action: () => {},
   },
   {
      type: "group",
      label: "Global Property Type",
      icon: SquarePenIcon,
      children: propertyTypesMenuItems,
   },
   {
      type: "separator",
   },
   {
      type: "action",
      label: "Delete Global Property",
      class: "text-error",
      icon: Trash2Icon,
      action: () => {},
   },
];
</script>

<li class="flex w-full items-center gap-1 py-1">
   <Button dropdownMenuItems={menuItems} class="w-full">
      <div class="flex grow items-center gap-1">
         {#if IconComponent}
            <IconComponent size="1.0625em" />
         {/if}
         {globalProperty.name}
      </div>
      <p class="text-muted-content">
         {globalProperty.linkedProperties.length}
      </p>
   </Button>
</li>
