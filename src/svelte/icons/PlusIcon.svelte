<script>
  import BaseIcon from "../components/BaseIcon.svelte";

  let { size, color, stroke } = $props();
</script>

<BaseIcon {size} {color} {stroke}>
  <path d="M12 5l0 14"></path>
  <path d="M5 12l14 0"></path>
</BaseIcon>
