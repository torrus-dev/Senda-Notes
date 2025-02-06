<script>
  let { variant = "neutral", onclick = null, children } = $props();
  // let style = `py-2 px-3 bg-${variant}-300 hover:bg-${variant}-400 dark:bg-${variant}-700 dark:hover:bg-${variant}-800 rounded-sm hover:cursor-pointer flex gap-1 items-center`;
  // HACER ESTO CON CSS CONVENCIONAL

  const variantStyles = {
    neutral:
      "bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-700 dark:hover:bg-neutral-800",
    lime: "bg-lime-300 hover:bg-lime-400 dark:bg-lime-700 dark:hover:bg-lime-800",
    rose: "bg-rose-300 hover:bg-rose-400 dark:bg-rose-700 dark:hover:bg-rose-800",
  };
  let style = `py-2 px-3 ${variantStyles[variant]} rounded-sm hover:cursor-pointer flex gap-1 items-center`;
</script>

<button class={style} {onclick}>{@render children()}</button>
