<script>
  import { noteController } from "../noteController.svelte";
  import { ChevronDownIcon, ChevronRightIcon } from "lucide-svelte";

  let { note, depth = 0 } = $props();

  // Estado de expansión local
  let isExpanded = $state(false);

  // Determinar si la nota está activa
  const isActive = $derived(note.id === noteController.activeNoteId);

  // Obtener notas hijas reales
  const childNotes = $derived(() =>
    note.children
      .map((id) => noteController.notes.find((n) => n.id === id))
      .filter(Boolean),
  );

  // Alternar expansión y prevenir propagación
  const toggleExpansion = (event) => {
    event.stopPropagation();
    isExpanded = !isExpanded;
  };

  // Manejar clic en el título
  const handleTitleClick = () => {
    noteController.setActiveNote(note.id);
    if (childNotes.length > 0 && !isExpanded) {
      isExpanded = true;
    }
  };
</script>

<li class="group/node list-none">
  <div
    class="flex items-center gap-1.5 py-1 pr-2 rounded-lg cursor-pointer select-none transition-colors
           hover:bg-gray-100/70
           {isActive ? 'bg-blue-100/80 hover:bg-blue-100' : ''}
           {depth > 0 ? '' : 'font-medium'}"
    style={`margin-left: ${depth * 20}px`}
    onclick={handleTitleClick}
    onkeydown={(e) => e.key === "Enter" && handleTitleClick()}
    tabindex="0"
  >
    {#if childNotes.length > 0}
      <button
        class="p-1 hover:bg-gray-200/50 rounded-md transition-colors"
        onclick={toggleExpansion}
        aria-label={isExpanded ? "Colapsar" : "Expandir"}
      >
        {#if isExpanded}
          <ChevronDownIcon size="18" class="text-gray-600" />
        {:else}
          <ChevronRightIcon size="18" class="text-gray-600" />
        {/if}
      </button>
    {:else}
      <!-- Espaciado para mantener la alineación -->
      <div class="w-[30px]"></div>
    {/if}

    <span class="truncate text-gray-800">
      {note.title || "Nota sin título"}
    </span>
  </div>

  {#if isExpanded && childNotes.length > 0}
    <ul class="space-y-1">
      {#each childNotes as childNote (childNote.id)}
        <NoteTreeNode note={childNote} depth={depth + 1} />
      {/each}
    </ul>
  {/if}
</li>

<style>
  /* Transición suave para la expansión */
  ul {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }
</style>
