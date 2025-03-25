<script lang="ts">
import { DateTime } from "luxon";
import type { NoteMetadata } from "../../../types/noteTypes";
let { metadata }: { metadata: NoteMetadata } = $props();
</script>

<ul class="text-base-content/70 flex w-full gap-6 px-4 py-2">
  <li>
    Created: {metadata.created.toFormat("yyyy-MM-dd HH:mm")}
  </li>
  <li>
    Modified: {metadata.modified.toFormat("yyyy-MM-dd HH:mm")}
  </li>
</ul>
