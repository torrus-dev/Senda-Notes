<script lang="ts">
import EmptyTab from "@components/note/EmptyTab.svelte";
import NoteContent from "@components/note/NoteContent.svelte";
import { workspaceController } from "@controllers/navigation/workspaceController.svelte";

// de momento uso activeTab, pero en el futuro con mas paneles le pasariamos uno de los tabgroup, aunque no se del todo como se organizara ya que sera mas complejo o igual no lo llego a implementar
let tab = $derived(workspaceController.getActiveTab());
</script>

{#if tab}
   {#if tab.noteReference !== undefined}
      <NoteContent tab={tab} />
   {:else}
      <EmptyTab tab={tab} />
   {/if}
{/if}
