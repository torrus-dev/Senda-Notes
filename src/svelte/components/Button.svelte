<script>
let { variant = "neutral", onclick = null, children } = $props();

const variantStyles = {
  neutral:
    "bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-700 dark:hover:bg-neutral-800",
  lime: "bg-lime-300 hover:bg-lime-400 dark:bg-lime-700 dark:hover:bg-lime-800",
  blue: "bg-blue-300 hover:bg-blue-400 dark:bg-blue-700 dark:hover:bg-blue-800",
};

let style = `py-2 px-3 ${variantStyles[variant]} rounded-sm hover:cursor-pointer`;
</script>

<button class={style} onclick={onclick}>{@render children()}</button>
