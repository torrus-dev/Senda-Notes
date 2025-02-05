<script>
  let { variant = "neutral", onclick = null, children } = $props();
  let style = `py-2 px-3 bg-${variant}-300 hover:bg-${variant}-400 dark:bg-${variant}-700 dark:hover:bg-${variant}-800 rounded-sm hover:cursor-pointer flex gap-1 items-center`;
</script>

<button class={style} {onclick}>{@render children()}</button>
