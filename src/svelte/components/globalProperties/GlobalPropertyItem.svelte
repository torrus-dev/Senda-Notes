<script lang="ts">
import type { MenuItem } from "@projectTypes/ui/contextMenuTypes";
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
import { globalPropertyController } from "@controllers/property/GlobalPropertyController.svelte";
import { globalConfirmationDialog } from "@controllers/menu/ConfirmationDialogController.svelte";
import GlobalPropertyNameInput from "@components/globalProperties/GlobalPropertyNameInput.svelte";
import { GlobalProperty } from "@domain/entities/GlobalProperty";

let { globalProperty }: { globalProperty: GlobalProperty } = $props();

let isRenaming: boolean = $state(false);

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
      action: () => {
         isRenaming = true;
      },
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
      disabled: globalProperty.linkedProperties.length > 0,
      class: "text-error",
      icon: Trash2Icon,
      action: () => {
         if (linkedPropertiesCount == 0) {
            globalConfirmationDialog.show({
               title: "Borrar Propiedad Global",
               message:
                  "Seguro que quieres borrar esta propiedad global, esta acción no puede deshacerse",
               variant: "danger",
               onAccept: () => {
                  globalPropertyController.deleteGlobalPropertyById(
                     globalProperty.id,
                  );
               },
            });
         }
      },
   },
];
</script>

<li class="w-full">
   <Button
      dropdownMenuItems={!isRenaming ? menuItems : undefined}
      class="w-full {isRenaming
         ? 'bg-interactive-focus outlined outline-interactive-accent-focus'
         : ''}">
      <div class="flex grow items-center gap-1">
         {#if IconComponent}
            <IconComponent size="1.0625em" />
         {/if}
         {#if !isRenaming}
            {globalProperty.name}
         {:else}
            <GlobalPropertyNameInput
               globalProperty={globalProperty}
               bind:isRenaming={isRenaming} />
         {/if}
      </div>
      <p class="text-muted-content">
         {linkedPropertiesCount}
      </p>
   </Button>
</li>
