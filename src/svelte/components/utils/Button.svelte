<script>
import {
  contextMenu,
  dropdownMenu,
} from "../../../directives/contextMenu.svelte";

let {
  variant = "base",
  cssClass = "",
  onclick = null,
  size = "medium",
  shape = "square",
  children,
  dropdownMenuDirective = undefined,
  contextMenuDirective = undefined,
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
  green:
    "bg-green-300 hover:bg-green-400 dark:bg-green-800 dark:hover:bg-green-900",
  lime: "bg-lime-300 hover:bg-lime-400 dark:bg-lime-800 dark:hover:bg-lime-900",
  bordered: "bordered",
};

let style = `whitespace-nowrap rounded-field bg-interactive inline-flex cursor-pointer items-center hover:text-base-content/70 focus:text-base-content/70 gap-2 ${sizeStyle[size]} ${colorStyle[variant]} ${cssClass}`;
</script>

<button
  {...htmlAttributes}
  class={style}
  onclick={onclick}
  use:dropdownMenu={dropdownMenuDirective}
  use:contextMenu={contextMenuDirective}
  bind:this={buttonElement}>{@render children()}</button>
