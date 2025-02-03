<script>
  import Title from "./components/Title.svelte";
  import Editor from "./components/Editor.svelte";
  import Properties from "./components/Properties.svelte";
  import { noteController } from "./noteController.svelte";

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

<div class="layout">
  <aside class="sidebar">
    <h2>Notes:</h2>
    <button class="new-note" onclick={noteController.createNote}
      >New Note</button
    >
    <ul>
      {#each notes as note}
        <li>
          <button
            class:active={note.id === activeNoteId}
            onclick={() => handleNoteAction("select", note.id)}
          >
            {note.title}
          </button>
          <button onclick={() => handleNoteAction("delete", note.id)}>🗑️</button
          >
        </li>
      {/each}
    </ul>
  </aside>

  <main class="container">
    {#if activeNote}
      <article class="note">
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
  .layout {
    --accent-color: rgb(0, 217, 255);
    display: flex;
    height: 100vh;
  }
  .container {
    max-width: 50%;
    min-width: 45em;
    margin: 0 auto;
  }
  .note {
    padding: 1em 4.5em;
    border-radius: 4px;
    background-color: white;
    box-shadow: 4px 4px 4px 4px #00000066;
  }

  .sidebar {
    min-width: 15em;
    align-self: stretch;
    background-color: aliceblue;
    padding: 1em;
  }
  .new-note {
    background-color: var(--accent-color);
    color: white;
    padding: 0.5em 1em;
    border-radius: 8px;
  }
</style>
