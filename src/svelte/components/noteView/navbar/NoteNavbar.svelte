<script lang="ts">
import MoreButton from "@components/noteView/navbar/MoreButton.svelte";
import Breadcrumbs from "@components/utils/Breadcrumbs.svelte";
let { noteId }: { noteId: string } = $props();
</script>

<div class="bg-base-100 p-2">
   <div class=" flex justify-between">
      <Breadcrumbs noteId={noteId} />
      <MoreButton noteId={noteId} />
   </div>
</div>
