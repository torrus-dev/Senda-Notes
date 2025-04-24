<style>
.property-list-container {
   position: relative;
}

.property-list-container:focus-within {
   border-color: var(--color-primary-500, #4299e1);
}

.item-badge {
   transition:
      background-color 0.2s ease,
      box-shadow 0.2s ease;
}

.item-badge[data-focused="true"] {
   background-color: var(--color-bg-hover, #e2e8f0);
}

/* Solución para el input que se adapta automáticamente */
.flex-input-container {
   flex: 1;
   min-width: 20px;
   display: flex;
}

.flexible-input {
   width: 100%;
   min-width: 1px;
}
</style>

<script lang="ts">
import { XIcon } from "lucide-svelte";
import Button from "@components/utils/Button.svelte";
import type { ListProperty } from "@projectTypes/propertyTypes";
import { onMount } from "svelte";

let {
   property,
   onUpdate,
}: {
   property: ListProperty;
   onUpdate: (newValue?: any) => void;
} = $props();

// Estado de referencia para el input y el contenedor
let inputElement: HTMLInputElement | undefined = $state(undefined);
let containerElement: HTMLDivElement | undefined = $state(undefined);
let isFocused: boolean = $state(false);
let focusedItemIndex: number | null = $state(null);

// Función para eliminar un elemento de la lista
function removeListItem(index: number) {
   const newValue = [...property.value];
   newValue.splice(index, 1);
   onUpdate(newValue);

   // Ajusta el índice enfocado después de eliminar
   if (focusedItemIndex !== null) {
      if (index === focusedItemIndex) {
         // Si eliminamos el item enfocado, movemos el foco
         if (index < property.value.length - 1) {
            // Mantener el mismo índice si hay más elementos a la derecha
            focusedItemIndex = index;
         } else if (index > 0) {
            // Mover al elemento anterior si estamos en el último
            focusedItemIndex = index - 1;
         } else {
            // Si no hay más elementos, enfocamos el input
            focusedItemIndex = null;
            setTimeout(() => inputElement?.focus(), 0);
         }
      } else if (index < focusedItemIndex) {
         // Si eliminamos un elemento antes del enfocado, ajustamos el índice
         focusedItemIndex--;
      }
   }
}

// Manejo de entrada en lista
function handleListInput(event: Event) {
   if (inputElement) {
      const inputValue = inputElement.value?.trim();

      if (event.type === "keydown") {
         const keyEvent = event as KeyboardEvent;

         if (keyEvent.key === "Enter" && inputValue) {
            const newValue = [...property.value, inputValue];
            onUpdate(newValue);
            inputElement.value = "";
         } else if (
            keyEvent.key === "Backspace" &&
            !inputValue &&
            property.value.length > 0
         ) {
            if (focusedItemIndex === null) {
               focusedItemIndex = property.value.length - 1;
               keyEvent.preventDefault();
            }
         } else if (
            keyEvent.key === "ArrowLeft" &&
            inputElement.selectionStart === 0 &&
            property.value.length > 0
         ) {
            focusedItemIndex = property.value.length - 1;
            keyEvent.preventDefault();
         }
      } else if (event.type === "blur" && inputValue) {
         // Añadir elemento al perder el foco si hay texto
         const newValue = [...property.value, inputValue];
         onUpdate(newValue);
         inputElement.value = "";
      }
   }
}

// Manejo de teclas en los elementos de la lista
function handleItemKeyDown(event: KeyboardEvent, index: number) {
   if (event.key === "Delete" || event.key === "Backspace") {
      removeListItem(index);
      event.preventDefault();
   } else if (event.key === "ArrowRight") {
      if (index === property.value.length - 1) {
         focusedItemIndex = null;
         setTimeout(() => inputElement?.focus(), 0);
      } else {
         focusedItemIndex = index + 1;
      }
      event.preventDefault();
   } else if (event.key === "ArrowLeft") {
      if (index > 0) {
         focusedItemIndex = index - 1;
      }
      event.preventDefault();
   }
}

// Manejar click en los elementos de la lista
function focusItem(index: number) {
   focusedItemIndex = index;
}

// Funciones para manejar el estado de foco del componente
function handleContainerFocus() {
   isFocused = true;
}

function handleContainerBlur(event: FocusEvent) {
   // Verificar si el foco sigue dentro del contenedor
   if (!containerElement?.contains(event.relatedTarget as Node)) {
      isFocused = false;
      focusedItemIndex = null;
   }
}

// Efecto para actualizar el enfoque cuando cambia focusedItemIndex
$effect(() => {
   if (focusedItemIndex !== null) {
      const items = containerElement?.querySelectorAll(".item-badge") || [];
      if (items[focusedItemIndex]) {
         (items[focusedItemIndex] as HTMLElement).focus();
      }
   }
});
</script>

<div
   class="property-list-container rounded-field bordered bg-interactive flex min-h-[30px] flex-wrap items-center gap-0.5 px-1 py-1"
   onfocusin={handleContainerFocus}
   onfocusout={handleContainerBlur}
   tabindex="-1"
   bind:this={containerElement}>
   {#each property.value as item, index}
      <div
         class="item-badge rounded-selector bg-base-300 focus:ring-primary-500 text-muted-content inline-flex items-center px-2 py-0.5 text-sm focus:ring-1 focus:outline-none"
         tabindex="0"
         onkeydown={(e) => handleItemKeyDown(e, index)}
         onclick={() => focusItem(index)}
         role="button"
         data-focused={focusedItemIndex === index}>
         <span>{item}</span>
         {#if isFocused}
            <Button
               class="text-faint-content"
               onclick={() => removeListItem(index)}
               size="small"
               title="Remove item"
               shape="square">
               <XIcon size="14" />
            </Button>
         {/if}
      </div>
   {/each}

   <div class="flex-input-container">
      <input
         name={property.name}
         type="text"
         class="flexible-input border-0 bg-transparent focus:ring-0 focus:outline-none"
         placeholder={property.value.length === 0 ? "Type to add items..." : ""}
         onkeydown={handleListInput}
         onblur={handleListInput}
         bind:this={inputElement} />
   </div>
</div>
