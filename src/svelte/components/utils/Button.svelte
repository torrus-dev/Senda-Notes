<script lang="ts">
import { dropdownMenu } from "@directives/floatingMenuDirective.svelte";
import type { MenuItem } from "@projectTypes/editorMenuTypes";
import type { Snippet } from "svelte";

let {
   class: userClass = "",
   onclick = undefined,
   size = "medium",
   shape = "square",
   children,
   dropdownMenuItems = undefined,
   buttonElement = $bindable(),
   disabled = false,
   ...htmlAttributes
}: {
   class?: string;
   onclick?: ((event: MouseEvent) => void) | undefined;
   onmouseenter?: ((event: MouseEvent) => void) | undefined;
   onmouseleave?: ((event: MouseEvent) => void) | undefined;
   title?: string;
   size?: "small" | "medium" | "large";
   shape?: "square" | "rect";
   children: Snippet;
   dropdownMenuItems?: MenuItem[] | undefined;
   buttonElement?: HTMLElement;
   disabled?: boolean;
} = $props();

if (onclick && dropdownMenuItems) {
   console.warn("Se esta pasando 'onclick' a un boton con dropdown");
   onclick = () => {};
}

// Define los estilos por tamaño
let sizeStyle = { small: "", medium: "", large: "" };

if (shape === "rect") {
   sizeStyle = {
      small: "py-1 px-2",
      medium: "py-2 px-3",
      large: "py-3 px-4",
   };
} else if (shape === "square") {
   sizeStyle = {
      small: "p-1",
      medium: "p-2",
      large: "p-3",
   };
}

// Estilo de tamaño basado en las props - usando la runa $derived correctamente
const sizeClass = $derived(sizeStyle[size as "small" | "medium" | "large"]);

// Clase adicional para el estado disabled
const disabledClass = $derived(
   disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
);
</script>

{#if dropdownMenuItems}
   <button
      {...htmlAttributes}
      class="
         rounded-field bg-interactive hover:text-muted-content focus:text-muted-content inline-flex cursor-pointer items-center gap-2 whitespace-nowrap
         {sizeClass} 
         {userClass} 
         {disabledClass} 
      "
      onclick={onclick}
      disabled={disabled}
      use:dropdownMenu={{
         menuItems: dropdownMenuItems,
         rightClickEnabled: true,
      }}
      bind:this={buttonElement}>
      {@render children()}
   </button>
{:else}
   <button
      {...htmlAttributes}
      class="
         rounded-field bg-interactive hover:text-muted-content focus:text-muted-content inline-flex cursor-pointer items-center gap-2 whitespace-nowrap
         {sizeClass} 
         {userClass}
      "
      disabled={disabled}
      onclick={onclick}
      bind:this={buttonElement}>
      {@render children()}
   </button>
{/if}
