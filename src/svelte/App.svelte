<script>
  import Title from "./components/Title.svelte";
  import Editor from "./components/Editor.svelte";
  import Properties from "./components/Properties.svelte";
  import { noteController } from "./noteController.svelte";
  import "./app.css";

  // Estado reactivo
  let activeNoteId = $state(noteController.activeNoteId);
  let notes = $derived(noteController.notes);

  // Nota activa derivada
  const activeNote = $derived(noteController.getActiveNote());

  function handleNoteAction(action, noteId) {
    if (action === "delete") {
      noteController.deleteNote(noteId);
    } else {
      noteController.setActiveNote(noteId);
    }
  }

  function handleTitleChange(newTitle) {
    if (activeNote) {
      noteController.updateNote(activeNote.id, {
        title: noteController.sanitizeTitle(newTitle),
      });
    }
  }

  function handleContentChange(newContent) {
    if (activeNote) {
      noteController.updateNote(activeNote.id, {
        content: newContent,
      });
    }
  }
</script>

<div class="h-screen grid grid-flow-col grid-cols-[12.5rem_1fr]">
  <aside class="bg-(--color-bg-secondary)">
    <header class="px-3 py-3 mb-2">
      <h2 class="text-2xl font-bold mb-2">Notes:</h2>
      <button
        class="p-2 rounded-md shadow bg-lime-400 hover:bg-lime-500 dark:bg-lime-600 dark:hover:bg-lime-700 hover:cursor-pointer"
        onclick={noteController.createNote}>New Note</button
      >
    </header>
    <ul>
      {#each notes as note}
        <li class="flex group px-3 hover:bg-(--color-interactive-hover)">
          <button
            class="text-left grow-1 py-1 hover:cursor-pointer"
            class:active={note.id === activeNoteId}
            onclick={() => handleNoteAction("select", note.id)}
          >
            {note.title}
          </button>
          <button
            class="grow-0 py-1 hover:cursor-pointer opacity-0 group-hover:opacity-100"
            onclick={() => handleNoteAction("delete", note.id)}>🗑️</button
          >
        </li>
      {/each}
    </ul>
  </aside>

  <main>
    {#if activeNote}
      <article class="p-3">
        <header>
          <Title title={activeNote.title} onTitleChange={handleTitleChange} />
          <Properties note={activeNote} />
          <Editor
            noteId={activeNote.id}
            content={activeNote.content}
            onContentChange={handleContentChange}
          />
        </header>
      </article>
    {:else}
      <div class="empty-state">
        <h1>Create or select a new note</h1>
        <p>A powerful block-styled editor</p>
      </div>
    {/if}
  </main>
</div>

<style>
</style>
