<script>
import { workspace } from "../../controllers/workspaceController.svelte";
import { closeOnOutsideOrEsc } from "../../../directives/closeOnOutsideOrEsc";
import Button from "../utils/Button.svelte";
import { XIcon } from "lucide-svelte";

let isOpen = $derived(workspace.isModalOpen());
let content = $derived(workspace.state.modal.content);

function closeModal() {
  workspace.closeModal();
}
</script>

{#if isOpen}
  <div
    class="absolute top-0 right-0 bottom-0 left-0 z-30 flex bg-black/30 backdrop-blur-xs"
    aria-hidden={!isOpen}>
    <div
      class="rounded-selector bg-base-200 bordered relative m-auto min-h-2/3 w-3xl p-6 shadow-xl"
      use:closeOnOutsideOrEsc={closeModal}
      role="dialog">
      <Button cssClass="top-0 right-0 absolute" onclick={closeModal}
        ><XIcon /></Button>
      {@render content()}
    </div>
  </div>
{/if}
