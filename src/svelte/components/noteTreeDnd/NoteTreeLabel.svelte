<style>
.isExpanded div {
  transform: rotate(90deg);
}
</style>

<script>
import { noteController } from "../../controllers/noteController.svelte";
import { ChevronRightIcon, PlusIcon } from "lucide-svelte";
import Button from "../Button.svelte";

let { note, toggleExpansion, isExpanded, isDragedOver } = $props();

let isActive = $derived(note.id === noteController.activeNoteId);

const handleSelectTitle = (event) => {
  if (event.key === "Enter" || event.type === "click") {
    noteController.setActiveNote(note.id);
  }
};

const hangleNewChildNote = (event) => {
  event.stopPropagation();
  noteController.createNote(note.id);
};
</script>

<div
  class="group rounded-field flex min-w-fit flex-row justify-between px-2 py-1.5 pl-1 whitespace-nowrap transition-colors select-none hover:bg-(--color-bg-hover)
    {isDragedOver ? 'highlight' : ''} 
    {isActive ? 'bg-(--color-bg-active)' : ''}"
  role="button"
  tabindex="0"
  onclick={handleSelectTitle}
  onkeydown={handleSelectTitle}>
  <div class="flex gap-1">
    {#if note.children && note.children.length > 0}
      <button
        class="transition-color rounded-selector cursor-pointer items-center whitespace-nowrap duration-200 ease-in-out hover:bg-(--color-bg-hover)
        {isExpanded ? 'isExpanded' : ''}"
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
  <Button
    onclick={hangleNewChildNote}
    cssClass="text-base-content/70 opacity-0 group-hover:opacity-100 p-1"
    size="small"
    title="Add note inside">
    <PlusIcon size="18"></PlusIcon>
  </Button>
</div>
