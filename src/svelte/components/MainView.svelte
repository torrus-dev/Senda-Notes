<script>
  import Title from "../components/Title.svelte";
  import Editor from "../components/Editor.svelte";
  import Properties from "../components/Properties.svelte";
  import { noteController } from "../noteController.svelte";
  import { MoreVerticalIcon, Trash2Icon } from "lucide-svelte";

  const activeNote = $derived(noteController.getActiveNote());

  let isOpen = false;
  let menuElement;

  function handleKeydown(e) {
    if (e.key === "Escape") {
      isOpen = false;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      isOpen = !isOpen;
    }
  }
</script>

<main class="overflow-auto">
  {#if activeNote}
    <div class="navbar shadow-sm py-2 px-8 border-neutral border-b-1">
      <div class="breadcrumbs text-sm flex-1">
        <ul class="text-lg">
          <li><a>Home</a></li>
          <li>Titulo de la nota (temporal)</li>
        </ul>
      </div>

      <details class="dropdown dropdown-end">
        <summary class="btn btn-neutral btn-square"
          ><MoreVerticalIcon size="20" /></summary
        >
        <ul
          class="menu dropdown-content bg-base-200 rounded-box z-1 w-44 p-2 shadow-sm border-neutral border-1 mt-2"
        >
          <li>
            <button
              class="text-delete"
              onclick={() => {
                noteController.deleteNote(activeNote.id);
              }}
              ><Trash2Icon size="18" />Delete Note
            </button>
          </li>
        </ul>
      </details>
    </div>

    <article class="p-3 w-3xl mx-auto">
      <header>
        <Title id={activeNote.id} />
        <Properties note={activeNote} />
        <Editor noteId={activeNote.id} />
      </header>
    </article>
  {:else}
    <article class="p-3 w-3xl mx-auto">
      <header>
        <h1>Create or select a new note</h1>
      </header>
    </article>
  {/if}
</main>
