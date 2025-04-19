<script lang="ts">
import { DateTime } from "luxon";

let { property, onUpdate } = $props();

// Convertir DateTime a formato 'YYYY-MM-DD' para el input
let newValue = $state(
  DateTime.isDateTime(property.value)
    ? property.value.toFormat("yyyy-MM-dd")
    : property.value,
);
</script>

<input
  name={property.name}
  type="date"
  bind:value={newValue}
  onchange={() => {
    const fechaDateTime = DateTime.fromFormat(newValue, "yyyy-MM-dd");
    onUpdate(fechaDateTime);
  }} />
