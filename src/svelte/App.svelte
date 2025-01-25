<script>
  import Title from "./components/Title.svelte";
  import Editor from "./components/Editor.svelte";
  import { noteController } from "./noteController.svelte";
  import Properties from "./components/Properties.svelte";

  let activeNote = $state(null);

  function handleSelectNote(event) {
    noteController.setActiveNote(event.target.id);
    activeNote = noteController.getActiveNote();
  }

  function handleDeleteNote(event) {
    noteController.deleteNote(event.target.id);
  }

  function onTitleChange(newTitle) {
    noteController.updateNote(activeNote.id, {
      title: noteController.sanitizeTitle(newTitle),
    });
  }

  function handleContentChange(newContent) {
    noteController.updateNote(activeNote.id, {
      content: newContent,
    });
  }

  $effect(() => {
    activeNote = noteController.getActiveNote();
  });
</script>

<div class="layout">
  <aside class="sidebar">
    <h2>Notes:</h2>
    <button class="new-note" onclick={noteController.createNote}
      >New Note</button
    >
    <ul>
      {#each noteController.notes as note}
        <li>
          <button id={note.id} onclick={handleSelectNote}>
            {note.title}
          </button>
          <button id={note.id} onclick={handleDeleteNote}>🗑️</button>
        </li>
      {/each}
    </ul>
  </aside>
  <main class="container">
    <article class="note">
      <header>
        {#if activeNote}
          <p class="note-id">ID: {activeNote.id}</p>
          <Title title={activeNote.title} {onTitleChange} />
          <Properties noteId={activeNote.id}></Properties>
          <Editor
            content={activeNote.content}
            noteId={activeNote.id}
            onContentChange={handleContentChange}
          />
        {:else}
          <h1>Create or select a new note</h1>
          <p>A powerful block-styled editor</p>
        {/if}
      </header>
    </article>
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
