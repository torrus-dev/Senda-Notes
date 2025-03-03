<script>
let { property, onUpdate } = $props();
let newValue = $state(property.value);
</script>

<input
  name={property.name}
  type="number"
  bind:value={newValue}
  onchange={(event) => {
    const value = Number(event.target.value);
    if (!isNaN(value)) {
      onUpdate(newValue);
    }
  }} />
