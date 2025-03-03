<script>
let { property, onUpdate } = $props();
let newValue = $state(property.value);
</script>

<input
  name={property.name}
  type="text"
  bind:value={newValue}
  onchange={() => onUpdate(newValue)}
  placeholder="No value" />
