<script lang="ts">
import type {
   ContextMenuData,
   GroupMenuItem,
   MenuItem,
} from "@projectTypes/floatingMenuTypes";

import { contextMenuController } from "@controllers/floatingMenuController.svelte";
import { computePosition, offset, flip, shift } from "@floating-ui/dom";
import Button from "@components/utils/Button.svelte";
import { closeOnOutsideOrEsc } from "@directives/closeOnOutsideOrEsc";
import { ChevronRight } from "lucide-svelte";

import { tick } from "svelte";

// Estado principal del menú
let { isOpen, menuItems, originalPosition }: ContextMenuData = $derived(
   contextMenuController.getMenuState(),
);

// Referencias y posicionamiento
let menuElement = $state<HTMLElement | null>(null);
let positionStyles = $state("left:0; top:0;");

// Estado de submenús
let activeSubMenu = $state<string | null>(null);
let subMenuElements = $state<Record<string, HTMLElement | null>>({});
let subMenuPositions = $state<Record<string, string>>({});

// Referencia virtual para el menú principal
const virtualReference = {
   getBoundingClientRect() {
      return {
         x: originalPosition?.x || 0,
         y: originalPosition?.y || 0,
         width: 1,
         height: 1,
         top: originalPosition?.y || 0,
         left: originalPosition?.x || 0,
         right: (originalPosition?.x || 0) + 1,
         bottom: (originalPosition?.y || 0) + 1,
      };
   },
};

// Posicionamiento del menú principal cuando cambia isOpen o originalPosition
$effect(() => {
   if (!isOpen) {
      // Limpiar estado al cerrar
      activeSubMenu = null;
      subMenuPositions = {};
      return;
   }

   if (originalPosition) {
      positionMainMenu();
   }
});

// Funciones de posicionamiento
async function positionMainMenu() {
   await tick();

   if (!menuElement || !originalPosition) return;

   const { x, y } = await computePosition(virtualReference, menuElement, {
      placement: "bottom-start",
      middleware: [
         offset(0),
         flip({ fallbackPlacements: ["top-start"] }),
         shift({ padding: 5 }),
      ],
   });

   positionStyles = `left:${x}px; top:${y}px;`;
}

async function positionSubMenu(itemId: string, parentItem: HTMLElement) {
   await tick();

   const subMenuElement = subMenuElements[itemId];
   if (!subMenuElement) return;

   // Referencia virtual basada en el elemento padre
   const subMenuReference = {
      getBoundingClientRect() {
         const rect = parentItem.getBoundingClientRect();
         return {
            x: rect.right,
            y: rect.top,
            width: 0,
            height: rect.height,
            top: rect.top,
            left: rect.right,
            right: rect.right,
            bottom: rect.bottom,
         };
      },
   };

   const { x, y } = await computePosition(subMenuReference, subMenuElement, {
      placement: "right-start",
      middleware: [
         offset(5),
         flip({
            fallbackPlacements: ["left-start", "right-end", "left-end"],
         }),
         shift({ padding: 5 }),
      ],
   });

   subMenuPositions[itemId] = `left:${x}px; top:${y}px;`;
}

// Gestión de submenús
async function activateSubMenu(itemId: string, parentItem: HTMLElement) {
   activeSubMenu = itemId;
   await positionSubMenu(itemId, parentItem);
}

// Utilidades
function isGroupMenuItem(item: MenuItem): item is GroupMenuItem {
   return "children" in item && Array.isArray(item.children);
}

function closeContextMenu() {
   contextMenuController.close();
}
</script>

{#if isOpen && menuItems && originalPosition}
   <div class="absolute z-100" style={positionStyles} bind:this={menuElement}>
      {#if menuItems.length > 0}
         <ul
            class="rounded-field outlined bg-base-200 flex min-w-40 flex-col p-1 shadow-xl"
            use:closeOnOutsideOrEsc={closeContextMenu}>
            {#each menuItems as menuItem, index}
               {#if "separator" in menuItem && menuItem.separator}
                  <!-- Separador -->
                  <li
                     class="border-border-normal my-1 w-full border-t-2"
                     role="separator">
                  </li>
               {:else if "label" in menuItem && menuItem.label}
                  {#if isGroupMenuItem(menuItem)}
                     <!-- Ítem con submenú -->
                     <li
                        class="relative"
                        onmouseenter={(e) =>
                           activateSubMenu(
                              `submenu-${index}`,
                              e.currentTarget,
                           )}>
                        <Button
                           size="small"
                           cssClass="w-full flex justify-between items-center">
                           <div class="flex items-center gap-2">
                              {#if menuItem.icon}
                                 <menuItem.icon size="1.0625rem" />
                              {/if}
                              <span>{menuItem.label}</span>
                           </div>
                           <ChevronRight size="1rem" />
                        </Button>

                        <!-- Submenú -->
                        {#if activeSubMenu === `submenu-${index}`}
                           <div
                              class="absolute z-110"
                              style={subMenuPositions[`submenu-${index}`] || ""}
                              bind:this={subMenuElements[`submenu-${index}`]}>
                              <ul
                                 class="rounded-field outlined bg-base-200 flex min-w-40 flex-col p-1 shadow-xl">
                                 {#each menuItem.children as subMenuItem}
                                    {#if "separator" in subMenuItem && subMenuItem.separator}
                                       <li
                                          class="border-border-normal my-1 w-full border-t-2"
                                          role="separator">
                                       </li>
                                    {:else if "label" in subMenuItem && subMenuItem.label}
                                       <li>
                                          <Button
                                             size="small"
                                             cssClass="w-full flex items-center gap-2"
                                             onclick={() => {
                                                if (
                                                   "onClick" in subMenuItem &&
                                                   subMenuItem.onClick
                                                ) {
                                                   subMenuItem.onClick();
                                                   closeContextMenu();
                                                }
                                             }}>
                                             {#if subMenuItem.icon}
                                                <subMenuItem.icon
                                                   size="1.0625rem" />
                                             {/if}
                                             <span>{subMenuItem.label}</span>
                                          </Button>
                                       </li>
                                    {/if}
                                 {/each}
                              </ul>
                           </div>
                        {/if}
                     </li>
                  {:else}
                     <!-- Ítem normal con acción -->
                     <li onmouseenter={() => (activeSubMenu = null)}>
                        <Button
                           size="small"
                           cssClass="w-full flex items-center gap-2"
                           onclick={menuItem.onClick}>
                           {#if menuItem.icon}
                              <menuItem.icon size="1.0625rem" />
                           {/if}
                           <span>{menuItem.label}</span>
                        </Button>
                     </li>
                  {/if}
               {/if}
            {/each}
         </ul>
      {/if}
   </div>
{/if}
