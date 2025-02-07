<script>
  import BaseIcon from "../components/BaseIcon.svelte";

  let { size, color, stroke } = $props();
</script>

<BaseIcon {size} {color} {stroke}>
  <path d="M9 6l11 0"></path>
  <path d="M9 12l11 0"></path>
  <path d="M9 18l11 0"></path>
  <path d="M5 6l0 .01"></path>
  <path d="M5 12l0 .01"></path>
  <path d="M5 18l0 .01"></path>
</BaseIcon>
