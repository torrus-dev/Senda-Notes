<script>
let { property, onUpdate } = $props();
</script>

<input
  name={property.name}
  type="date"
  value={property.value instanceof Date
    ? property.value.toISOString().split("T")[0]
    : property.value}
  onchange={(e) => onUpdate(property.name, new Date(e.target.value))}
  disabled={readonly} />
