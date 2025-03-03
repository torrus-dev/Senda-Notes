<script>
import { formatDateTimeForInput } from "../../../controllers/utils.svelte";
let { property, onUpdate } = $props();
let newValue = $state(
  property.value instanceof Date
    ? formatDateTimeForInput(property.value.toISOString())
    : formatDateTimeForInput(property.value),
);
</script>

<input
  name={property.name}
  type="datetime-local"
  bind:value={newValue}
  onchange={() => onUpdate(newValue)} />
