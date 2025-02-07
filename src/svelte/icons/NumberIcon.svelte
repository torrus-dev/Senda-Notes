<script>
  import BaseIcon from "../components/BaseIcon.svelte";

  let { size, color, stroke } = $props();
</script>

<BaseIcon {size} {color} {stroke}>
  <path d="M3 10l2 -2v8"></path>
  <path
    d="M9 8h3a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 0 -1 1v2a1 1 0 0 0 1 1h3"
  ></path>
  <path
    d="M17 8h2.5a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1 -1.5 1.5h-1.5h1.5a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1 -1.5 1.5h-2.5"
  ></path>
</BaseIcon>
