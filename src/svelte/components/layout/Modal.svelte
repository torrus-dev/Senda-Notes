<script>
import { workspace } from "../../controllers/workspaceController.svelte";
import { closeOnOutsideOrEsc } from "../../../directives/closeOnOutsideOrEsc";

let { children, title = "Modal" } = $props();

let isOpen = $derived(workspace.isModalOpen());

function closeModal() {
  workspace.closeModal();
}
</script>

{#if isOpen}
  <div
    class="absolute top-0 right-0 bottom-0 left-0 z-30 flex bg-black/30 backdrop-blur-xs">
    <div
      class="rounded-selector bg-base-200 bordered m-auto min-h-2/3 w-3xl p-6 shadow-xl"
      use:closeOnOutsideOrEsc={closeModal}
      aria-hidden={!isOpen}>
      <h1 class="text-3xl">{title}</h1>
      {@render children()}
    </div>
  </div>
{/if}
