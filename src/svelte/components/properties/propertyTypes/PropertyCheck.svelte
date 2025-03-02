<script>
let { property, onUpdate } = $props();
</script>

<input
  name={property.name}
  type="checkbox"
  checked={property.value}
  onchange={(e) => onUpdate(property.name, e.target.checked)}
  disabled={readonly} />
