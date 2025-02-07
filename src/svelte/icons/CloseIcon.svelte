<script>
  import BaseIcon from "../components/BaseIcon.svelte";

  let { size, color, stroke } = $props();
</script>

<BaseIcon {size} {color} {stroke}>
  <path d="M18 6l-12 12"></path>
  <path d="M6 6l12 12"></path>
</BaseIcon>
