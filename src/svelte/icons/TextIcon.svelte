<script>
  import BaseIcon from "../components/BaseIcon.svelte";

  let { size, color, stroke } = $props();
</script>

<BaseIcon {size} {color} {stroke}>
  <path d="M4 6l16 0"></path>
  <path d="M4 12l16 0"></path>
  <path d="M4 18l12 0"></path>
</BaseIcon>
