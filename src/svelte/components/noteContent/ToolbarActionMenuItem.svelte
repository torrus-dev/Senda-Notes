<script lang="ts">
import Button from "@components/utils/Button.svelte";
import type { ActionMenuItem } from "@projectTypes/editorMenuTypes";
let { menuItem }: { menuItem: ActionMenuItem } = $props();
</script>

<li>
   <Button
      size="small"
      class="{menuItem.class} {menuItem.checked ? 'highlight' : ''}"
      onclick={() => {
         menuItem.action?.();
      }}
      tooltip={menuItem.label}>
      <menuItem.icon size="1.25rem" />
   </Button>
</li>
