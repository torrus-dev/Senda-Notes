<script>
  let {
    size = "medium",
    color = "currentColor",
    stroke = "1.75",
    children,
  } = $props();
  let style = `icon-${size}`;
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  class={style}
  fill="none"
  stroke={color}
  stroke-linecap="round"
  stroke-linejoin="round"
  width="24"
  height="24"
  stroke-width={stroke}
>
  {@render children()}
</svg>
