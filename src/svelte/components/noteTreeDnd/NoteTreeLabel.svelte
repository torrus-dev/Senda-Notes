<style>
.isExpanded div {
  transform: rotate(90deg);
}
</style>

<script>
import { dndController } from "../../controllers/dndController.svelte";
import { noteController } from "../../controllers/noteController.svelte";
import { ChevronRightIcon } from "lucide-svelte";

let { note, position = -1, depth = 0, toggleExpansion, isExpanded } = $props();

let isActive = $derived(note.id === noteController.activeNoteId);

const handleSelectTitle = (event) => {
  if (event.key === "Enter" || event.type === "click") {
    noteController.setActiveNote(note.id);
  }
};
</script>

<div
  class="rounded-field ml-1.5 flex gap-1 px-2 py-1.5 pl-1 whitespace-nowrap transition-colors select-none hover:bg-(--color-bg-hover) {isActive
    ? 'bg-(--color-bg-active)'
    : ''}"
  role="button"
  tabindex="0"
  style={`margin-left: calc(var(--spacing) * ${depth})`}
  onclick={handleSelectTitle}
  onkeydown={handleSelectTitle}>
  {#if note.children && note.children.length > 0}
    <button
      class="transition-color rounded-selector cursor-pointer items-center whitespace-nowrap duration-200 ease-in-out hover:bg-(--color-bg-hover) {isExpanded
        ? 'isExpanded'
        : ''}"
      onclick={toggleExpansion}
      aria-expanded={isExpanded ? "true" : "false"}
      aria-label={isExpanded ? "Colapsar" : "Expandir"}>
      <div class="transition duration-200">
        <ChevronRightIcon size="16" aria-hidden="true" />
      </div>
    </button>
  {:else}
    <span class="w-4"></span>
  {/if}
  <span class="truncate">{note.title}</span>
</div>
