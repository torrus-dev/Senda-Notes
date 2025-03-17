<script>
import { propertyController } from "../../../controllers/propertyController.svelte";

import PropertyText from "./PropertyText.svelte";
import PropertyList from "./PropertyList.svelte";
import PropertyNumber from "./PropertyNumber.svelte";
import PropertyCheck from "./PropertyCheck.svelte";
import PropertyDate from "./PropertyDate.svelte";
import PropertyDatetime from "./PropertyDateTime.svelte";

const components = {
  text: PropertyText,
  list: PropertyList,
  number: PropertyNumber,
  check: PropertyCheck,
  date: PropertyDate,
  datetime: PropertyDatetime,
};

let { property, noteId } = $props();

function handlePropertyUpdateValue(newValue) {
  if (!noteId) return;
  propertyController.updateProperty(noteId, property.id, { value: newValue });
}

let PropertyComponent = $derived(components[property.type]);
</script>

<PropertyComponent property={property} onUpdate={handlePropertyUpdateValue}
></PropertyComponent>
