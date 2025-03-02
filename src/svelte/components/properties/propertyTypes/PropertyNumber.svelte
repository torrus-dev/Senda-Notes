<script>
let { property, onUpdate } = $props();
</script>

<input
  name={property.name}
  type="number"
  value={property.value}
  onchange={(event) => {
    const value = Number(event.target.value);
    if (!isNaN(value)) {
      onUpdate(property.name, value);
    }
  }}
  disabled={readonly} />
