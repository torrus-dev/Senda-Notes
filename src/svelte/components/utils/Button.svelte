<script lang="ts">
import {
   contextMenu,
   dropdownMenu,
} from "@directives/floatingMenuDirective.svelte";

let {
   cssClass = "",
   onclick = null,
   size = "medium",
   shape = "square",
   children,
   dropdownMenuItems = undefined,
   contextMenuItems = undefined,
   buttonElement = $bindable(),
   ...htmlAttributes
} = $props();

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

let style = `whitespace-nowrap rounded-field bg-interactive inline-flex cursor-pointer items-center hover:text-base-content/70 focus:text-base-content/70 gap-2 ${sizeStyle ? sizeStyle[size] : ""} ${cssClass}`;

function handleClick(event: Event) {
   if (onclick) {
      onclick(event);
   } else {
      console.warn("no se ha pasado onclick al boton");
   }

   buttonElement.blur();
}
</script>

{#snippet button()}
   {@const optionalAttr = {
      ...(dropdownMenuItems ? { "use:dropdownMenu": dropdownMenuItems } : {}),
      ...(contextMenuItems ? { "use:contextMenu": contextMenuItems } : {}),
   }}

   <button
      bind:this={buttonElement}
      class={style}
      onclick={handleClick}
      {...optionalAttr}
      {...htmlAttributes}>
      {@render children()}
   </button>
{/snippet}

{@render button()}
