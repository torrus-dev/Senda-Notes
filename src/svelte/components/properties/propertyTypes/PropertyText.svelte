<script>
let { property, onUpdate } = $props();
</script>

<input
  name={property.name}
  type="text"
  value={property.value}
  onchange={(event) => onUpdate(property.name, event.target.value)}
  placeholder="No value" />
