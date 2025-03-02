<script>
import { formatDateTimeForInput } from "../../../controllers/utils.svelte";
let { property, onUpdate } = $props();
</script>

<input
  name={property.name}
  type="datetime-local"
  value={property.value instanceof Date
    ? formatDateTimeForInput(property.value.toISOString())
    : formatDateTimeForInput(property.value)}
  onchange={(e) => onUpdate(property.name, new Date(e.target.value))}
  disabled={readonly} />
