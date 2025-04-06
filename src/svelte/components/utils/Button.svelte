<script>
import {
   contextMenu,
   dropdownMenu,
} from "@directives/floatingMenuDirective.svelte";

let {
   class: userClass = "",
   onclick = null,
   size = "medium",
   shape = "square",
   children,
   dropdownMenuItems = undefined,
   contextMenuItems = undefined,
   buttonElement = $bindable(),
   ...htmlAttributes
} = $props();

if (onclick && dropdownMenuItems) {
   console.warn("Se esta pasando 'onclick' a un elemento con dropdown");
   onclick = null;
}

// Define los estilos por tamaño
let sizeStyle;

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
const sizeClass = $derived(sizeStyle[size]);
</script>

<button
   {...htmlAttributes}
   class="
      rounded-field bg-interactive hover:text-base-content/70 focus:text-base-content/70 inline-flex cursor-pointer items-center gap-2 whitespace-nowrap
      {sizeClass} 
      {userClass}
   "
   onclick={onclick}
   use:dropdownMenu={dropdownMenuItems}
   use:contextMenu={contextMenuItems}
   bind:this={buttonElement}>
   {@render children()}
</button>
