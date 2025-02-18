<script>
  import NoteTreeNode from "./NoteTreeNode.svelte";
  import { noteController } from "../noteController.svelte";
  import { ChevronDownIcon, ChevronRightIcon } from "lucide-svelte";

  let { note, depth = 0 } = $props();

  // Estado de expansión local
  let isExpanded = $state(true);

  // Determinar si la nota está activa
  const isActive = $derived(note.id === noteController.activeNoteId);

  // Alternar expansión y prevenir propagación
  const toggleExpansion = (event) => {
    event.stopPropagation();
    isExpanded = !isExpanded;
  };

  // Manejar clic en el título (unificado con el manejo de teclado)
  const handleTitleClick = (event) => {
    if (event.key === "Enter" || event.type === "click") {
      noteController.setActiveNote(note.id);
      if (note.children.length > 0 && !isExpanded) {
        isExpanded = true;
      }
    }
  };
</script>

<li class="group/node list-none cursor-pointer">
  <div
    class="flex ml-1.5 py-1 rounded-field select-none transition-colors
      hover:bg-(--color-neutral) {isActive ? 'bg-(--color-neutral)' : ''}"
    role="button"
    tabindex="0"
    style={`margin-left: ${depth * 0.25}rem`}
    onclick={handleTitleClick}
    onkeydown={handleTitleClick}
  >
    {#if note.children.length > 0}
      <button
        class="p-1 hover:bg-(--color-neutral) rounded-field transition-colors"
        onclick={toggleExpansion}
        aria-expanded={isExpanded ? "true" : "false"}
        aria-label={isExpanded ? "Colapsar" : "Expandir"}
      >
        {#if isExpanded}
          <ChevronDownIcon size="18" aria-hidden="true" />
        {:else}
          <ChevronRightIcon size="18" aria-hidden="true" />
        {/if}
      </button>
    {/if}
    <span class="truncate">{note.title}</span>
  </div>

  {#if isExpanded && note.children.length > 0}
    <ul class="space-y-1">
      {#each note.children as noteId}
        <!-- Llamada recursiva al mismo componente -->
        <NoteTreeNode
          note={noteController.getNoteById(noteId)}
          depth={depth + 1}
        />
      {/each}
    </ul>
  {/if}
</li>

<style>
  ul {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }
</style>
