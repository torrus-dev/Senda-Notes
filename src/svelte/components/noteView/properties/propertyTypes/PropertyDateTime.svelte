<script lang="ts">
import { DateTime } from "luxon";

let { property, onUpdate } = $props();
let newValue = $state(
  DateTime.isDateTime(property.value)
    ? property.value.toFormat("yyyy-MM-dd'T'HH:mm")
    : property.value,
);
</script>

<input
  name={property.name}
  type="datetime-local"
  bind:value={newValue}
  onchange={() => onUpdate(newValue)} />
