<script>
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

let style = `whitespace-nowrap rounded-field bg-interactive inline-flex cursor-pointer items-center hover:text-base-content/70 focus:text-base-content/70 gap-2 ${sizeStyle[size]} ${cssClass}`;
</script>

{#if dropdownMenuItems && contextMenuItems}
   <button
      {...htmlAttributes}
      class={style}
      onclick={onclick}
      use:dropdownMenu={dropdownMenuItems}
      use:contextMenu={contextMenuItems}
      bind:this={buttonElement}>
      {@render children()}
   </button>
{:else if dropdownMenuItems}
   <button
      {...htmlAttributes}
      class={style}
      onclick={onclick}
      use:dropdownMenu={dropdownMenuItems}
      bind:this={buttonElement}>
      {@render children()}
   </button>
{:else if contextMenuItems}
   <button
      {...htmlAttributes}
      class={style}
      onclick={onclick}
      use:contextMenu={contextMenuItems}
      bind:this={buttonElement}>
      {@render children()}
   </button>
{:else}
   <button
      {...htmlAttributes}
      class={style}
      onclick={onclick}
      bind:this={buttonElement}>
      {@render children()}
   </button>
{/if}
