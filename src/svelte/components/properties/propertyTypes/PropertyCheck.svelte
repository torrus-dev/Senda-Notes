<script>
let { property, onUpdate } = $props();
let newValue = $state(property.value);
</script>

<input
  name={property.name}
  type="checkbox"
  bind:checked={newValue}
  onchange={() => onUpdate(newValue)}
  class="w-5" />
