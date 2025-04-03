<script>
import { XIcon } from "lucide-svelte";
import Button from "@components/utils/Button.svelte";

let { property, onUpdate } = $props();

// Estado de referencia para el input (en caso de list)
let inputElement = $state(null);
let isEditing = false;

// Función para eliminar un elemento de la lista
function removeListItem(index) {
   if (property.type === "list") {
      const newValue = [...property.value];
      newValue.splice(index, 1);
      onUpdate(newValue);
   }
}

// Manejo de entrada en lista
function handleListInput(event) {
   if (event.key === "Enter" || event.type === "blur") {
      const inputValue = inputElement.value.trim();
      if (!inputValue) return;
      const newValue = [...property.value, inputValue];
      onUpdate(newValue);
      inputElement.value = "";
   }
   if (event.key === "Backspace" || event.key === "Delete") {
      let lastListItem = property.value.length - 1;
      removeListItem(lastListItem);
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
               cssClass="mr-[-0.25rem] text-base-content/50"
               onclick={() => removeListItem(index)}
               aria-label="Remove item"
               size="small"
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
