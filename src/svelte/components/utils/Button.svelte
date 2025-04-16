<script lang="ts">
import {
   contextMenu,
   dropdownMenu,
} from "@directives/floatingMenuDirective.svelte";
import type { MenuItem } from "@projectTypes/editorMenuTypes";
import type { Snippet } from "svelte";

let {
   class: userClass = "",
   onclick = undefined,
   size = "medium",
   shape = "square",
   children,
   dropdownMenuItems = undefined,
   contextMenuItems = undefined,
   buttonElement = $bindable(),
   ...htmlAttributes
}: {
   class?: string;
   onclick?: ((event: MouseEvent) => void) | undefined;
   title?: string;
   size?: "small" | "medium" | "large";
   shape?: "square" | "rect";
   children: Snippet;
   dropdownMenuItems?: MenuItem[] | undefined;
   contextMenuItems?: MenuItem[] | undefined;
   buttonElement?: HTMLElement;
} = $props();

if (onclick && dropdownMenuItems) {
   console.warn("Se esta pasando 'onclick' a un elemento con dropdown");
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
</script>

{#if dropdownMenuItems && contextMenuItems}
   <button
      {...htmlAttributes}
      class="
         rounded-field bg-interactive hover:text-muted-content focus:text-muted-content inline-flex cursor-pointer items-center gap-2 whitespace-nowrap
         {sizeClass} 
         {userClass}
      "
      onclick={onclick}
      use:dropdownMenu={dropdownMenuItems}
      use:contextMenu={contextMenuItems}
      bind:this={buttonElement}>
      {@render children()}
   </button>
{:else if dropdownMenuItems}
   <button
      {...htmlAttributes}
      class="
         rounded-field bg-interactive hover:text-muted-content focus:text-muted-content inline-flex cursor-pointer items-center gap-2 whitespace-nowrap
         {sizeClass} 
         {userClass}
      "
      onclick={onclick}
      use:dropdownMenu={dropdownMenuItems}
      bind:this={buttonElement}>
      {@render children()}
   </button>
{:else if contextMenuItems}
   <button
      {...htmlAttributes}
      class="
         rounded-field bg-interactive hover:text-muted-content focus:text-muted-content inline-flex cursor-pointer items-center gap-2 whitespace-nowrap
         {sizeClass} 
         {userClass}
      "
      onclick={onclick}
      use:contextMenu={contextMenuItems}
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
      onclick={onclick}
      bind:this={buttonElement}>
      {@render children()}
   </button>
{/if}
