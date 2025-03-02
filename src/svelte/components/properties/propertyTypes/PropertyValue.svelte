<script>
import PropertyText from "./PropertyText.svelte";
import PropertyList from "./PropertyList.svelte";
import PropertyNumber from "./PropertyNumber.svelte";
import PropertyCheck from "./PropertyCheck.svelte";
import PropertyDate from "./PropertyDate.svelte";
import PropertyDatetime from "./PropertyDatetime.svelte";

const components = {
  text: PropertyText,
  list: PropertyList,
  number: PropertyNumber,
  check: PropertyCheck,
  date: PropertyDate,
  datetime: PropertyDatetime,
};

let { property, onUpdate, readonly = false } = $props();

let PropertyComponent = $derived(components[property.type]);
</script>

<PropertyComponent property={property} onUpdate={onUpdate} readonly={readonly}
></PropertyComponent>
