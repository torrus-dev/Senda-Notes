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

let globalPropertyElement: HTMLElement | undefined = $state();
let showHasLinkedPropertiesWarning: boolean = $state(false);

let linkedPropertiesCount = $derived(globalProperty.linkedProperties.length);
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
      disabled: () => linkedPropertiesCount > 0,
      class: "text-error",
      icon: Trash2Icon,
      action: () => {
         if (linkedPropertiesCount === 0) {
            // mostrar con un dialogo de confirmación cuando este creado
            globalPropertyController.deleteGlobalPropertyById(
               globalProperty.id,
            );
         }
      },
   },
];
</script>

<li
   class="flex w-full items-center gap-1 py-1"
   bind:this={globalPropertyElement}>
   <Button dropdownMenuItems={menuItems} class="w-full">
      <div class="flex grow items-center gap-1">
         {#if IconComponent}
            <IconComponent size="1.0625em" />
         {/if}
         {globalProperty.name}
      </div>
      <p class="text-muted-content">
         {linkedPropertiesCount}
      </p>
   </Button>
</li>
