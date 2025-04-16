<script lang="ts">
import { XIcon } from "lucide-svelte";
import Button from "@components/utils/Button.svelte";
import type { Property } from "@projectTypes/noteTypes";

let {
   property,
   onUpdate,
}: {
   property: {
      id: string;
      name: string;
      value: string[];
      type: "list";
   };
   onUpdate: (newValue?: any) => void;
} = $props();

// Estado de referencia para el input (en caso de list)
let inputElement: HTMLInputElement | undefined = $state(undefined);
let isEditing = false;

// Función para eliminar un elemento de la lista
function removeListItem(index: number) {
   if (property.type === "list") {
      const newValue = [...property.value];
      newValue.splice(index, 1);
      onUpdate(newValue);
   }
}

// Manejo de entrada en lista
function handleListInput(event: Event) {
   if (inputElement) {
      if ((event as KeyboardEvent).key === "Enter" || event.type === "blur") {
         const inputValue = inputElement.value?.trim();
         if (!inputValue) return;
         const newValue = [...property.value, inputValue];
         onUpdate(newValue);
         inputElement.value = "";
      }
      if (
         (event as KeyboardEvent).key === "Backspace" ||
         (event as KeyboardEvent).key === "Delete"
      ) {
         let lastListItem = property.value.length - 1;
         removeListItem(lastListItem);
      }
   }
}
</script>

<div
   class="rounded-field bordered inline-flex flex-wrap items-center gap-1 px-1">
   {#each property.value as item, index}
      <div
         class="rounded-selector bg-base-200 inline-flex items-center p-1 text-sm hover:bg-(--color-bg-hover)">
         <span>{item}</span>
         {#if !isEditing}
            <Button
               class="text-faint-content mr-[-0.25rem]"
               onclick={() => removeListItem(index)}
               size="small"
               title="Remove item"
               shape="square">
               <XIcon size="14" />
            </Button>
         {/if}
      </div>
   {/each}
   <input
      name={property.name}
      type="text"
      class="flex"
      placeholder={property.value.length === 0 ? "Type to add items..." : ""}
      onkeydown={handleListInput}
      onblur={handleListInput}
      bind:this={inputElement} />
</div>
