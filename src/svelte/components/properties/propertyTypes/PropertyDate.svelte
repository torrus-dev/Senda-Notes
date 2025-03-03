<script>
let { property, onUpdate } = $props();
let newValue = $state(
  property.value instanceof Date
    ? property.value.toISOString().split("T")[0]
    : property.value,
);
</script>

<input
  name={property.name}
  type="date"
  bind:value={newValue}
  onchange={() => onUpdate(newValue)} />
