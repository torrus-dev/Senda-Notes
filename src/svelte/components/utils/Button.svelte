<script>
import {
   contextMenu,
   dropdownMenu,
} from "@directives/floatingMenuDirective.svelte";

let {
   variant = "base",
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

const colorStyle = {
   base: "",
   neutral:
      "bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-800 dark:hover:bg-neutral-900",
   lime: "bg-lime-300 hover:bg-lime-400 dark:bg-lime-800 dark:hover:bg-lime-900",
   blue: "bg-blue-300 hover:bg-blue-400 dark:bg-blue-800 dark:hover:bg-blue-900",
   rose: "bg-rose-300 hover:bg-rose-400 dark:bg-rose-800 dark:hover:bg-rose-900",
   green: "bg-green-300 hover:bg-green-400 dark:bg-green-800 dark:hover:bg-green-900",
   lime: "bg-lime-300 hover:bg-lime-400 dark:bg-lime-800 dark:hover:bg-lime-900",
   bordered: "bordered",
};

let style = `whitespace-nowrap rounded-field bg-interactive inline-flex cursor-pointer items-center hover:text-base-content/70 focus:text-base-content/70 gap-2 ${sizeStyle[size]} ${colorStyle[variant]} ${cssClass}`;
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
