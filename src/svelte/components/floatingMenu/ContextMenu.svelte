<script lang="ts">
import type {
   ContextMenuData,
   GroupMenuItem,
   MenuItem,
} from "@projectTypes/floatingMenuTypes";

import { contextMenuController } from "@controllers/floatingMenuController.svelte";
import {
   computePosition,
   offset,
   flip,
   shift,
   autoPlacement,
} from "@floating-ui/dom";
import Button from "@components/utils/Button.svelte";
import { closeOnOutsideOrEsc } from "@directives/closeOnOutsideOrEsc";

import { tick } from "svelte";

let { isOpen, menuItems, originalPosition }: ContextMenuData = $derived(
   contextMenuController.getMenuState(),
);
let menuElement = $state<HTMLElement | null>(null);
let positionStyles = $state("left:0; top:0;");

// Para los submenús
let activeSubMenu = $state<string | null>(null);
let subMenuElements = $state<Record<string, HTMLElement | null>>({});
let subMenuPositions = $state<Record<string, string>>({});

// Virtual reference: un rectángulo de 1x1 en originalPosition
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

// Posicionamiento del menú principal
$effect(() => {
   if (isOpen === true && originalPosition) {
      tick().then(async () => {
         if (menuElement && originalPosition) {
            const { x, y } = await computePosition(
               virtualReference,
               menuElement,
               {
                  placement: "bottom-start", // posición por defecto: abajo y a la derecha
                  middleware: [
                     offset(0), // sin desplazamiento adicional; puedes ajustar si lo deseas
                     flip({ fallbackPlacements: ["top-start"] }), // si no cabe abajo, se posiciona arriba
                     shift({ padding: 5 }), // evita que se desborde; padding opcional
                  ],
               },
            );
            positionStyles = `left:${x}px; top:${y}px;`;
         }
      });
   }
});

// Función para manejar el hover en ítems con submenús
async function handleSubMenuHover(itemId: string, parentItem: HTMLElement) {
   activeSubMenu = itemId;

   // Necesitamos esperar a que el DOM se actualice
   await tick();

   const subMenuElement = subMenuElements[itemId];
   if (subMenuElement) {
      // Definimos la referencia virtual para el submenú
      const subMenuReference = {
         getBoundingClientRect() {
            const rect = parentItem.getBoundingClientRect();
            return {
               x: rect.right, // Tomamos la esquina superior derecha del ítem padre
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

      // Calculamos la posición del submenú
      const { x, y } = await computePosition(subMenuReference, subMenuElement, {
         placement: "right-start", // Por defecto, a la derecha
         middleware: [
            offset(5), // Pequeño espacio entre el ítem y el submenú
            flip({
               fallbackPlacements: ["left-start", "right-end", "left-end"],
               // Si no hay espacio a la derecha, intentar a la izquierda
               // Si no hay espacio abajo, intentar arriba
            }),
            shift({ padding: 5 }),
         ],
      });

      subMenuPositions[itemId] = `left:${x}px; top:${y}px;`;
   }
}

// Función para cerrar el submenú cuando el mouse sale
function handleSubMenuLeave() {
   activeSubMenu = null;
}

// Función para verificar si un ítem es un GroupMenuItem
function isGroupMenuItem(item: MenuItem): item is GroupMenuItem {
   return "children" in item && Array.isArray(item.children);
}
</script>

{#if isOpen && menuItems && originalPosition}
   <!-- Menú contextual -->
   <div class="absolute z-100" style={positionStyles} bind:this={menuElement}>
      {#if menuItems.length > 0}
         <ul
            class="rounded-field outlined bg-base-200 flex flex-col p-1 shadow-xl"
            use:closeOnOutsideOrEsc={() => contextMenuController.close()}>
            {#each menuItems as menuItem, index}
               {#if "separator" in menuItem && menuItem.separator}
                  <li
                     class="border-border-normal my-1 w-full border-t-2"
                     role="separator">
                  </li>
               {:else if "label" in menuItem && menuItem.label}
                  {#if isGroupMenuItem(menuItem)}
                     <!-- Ítem con submenú -->
                     <li
                        onmouseenter={(e) =>
                           handleSubMenuHover(
                              `submenu-${index}`,
                              e.currentTarget,
                           )}
                        onmouseleave={handleSubMenuLeave}
                        class="relative">
                        <Button
                           size="small"
                           cssClass="w-full flex justify-between items-center">
                           <div class="flex items-center">
                              {#if menuItem.icon}
                                 <menuItem.icon size="1.0625rem" />
                              {/if}
                              <span>{menuItem.label}</span>
                           </div>
                           <!-- Indicador de submenú -->
                           <span class="ml-2">›</span>
                        </Button>

                        <!-- Submenú -->
                        {#if activeSubMenu === `submenu-${index}`}
                           <div
                              class="absolute z-110"
                              style={subMenuPositions[`submenu-${index}`] || ""}
                              bind:this={subMenuElements[`submenu-${index}`]}>
                              <ul
                                 class="rounded-field outlined bg-base-200 flex min-w-32 flex-col p-1 shadow-xl">
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
                                             cssClass="w-full"
                                             onclick={() => {
                                                if (
                                                   "onClick" in subMenuItem &&
                                                   subMenuItem.onClick
                                                ) {
                                                   subMenuItem.onClick();
                                                   contextMenuController.close();
                                                }
                                             }}>
                                             {#if subMenuItem.icon}
                                                <subMenuItem.icon
                                                   size="1.0625rem" />
                                             {/if}
                                             {subMenuItem.label}
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
                     <li>
                        <Button
                           size="small"
                           cssClass="w-full"
                           onclick={menuItem.onClick}>
                           {#if menuItem.icon}
                              <menuItem.icon size="1.0625rem" />
                           {/if}
                           {menuItem.label}
                        </Button>
                     </li>
                  {/if}
               {/if}
            {/each}
         </ul>
      {/if}
   </div>
{/if}
