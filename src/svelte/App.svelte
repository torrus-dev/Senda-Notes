<script>
  import Editor from "./Editor.svelte";
  import Title from "./Title.svelte";
  import {
    notes,
    currentNote,
    loadNotes,
    createNote,
    selectNote,
    deleteNote,
  } from "./noteController";

  loadNotes();

  $: notesList = $notes;
  $: selectedNote = $currentNote;

  function handleSelectNote(event) {
    selectNote(event.target.id);
  }

  function handleDeleteNote(event) {
    deleteNote(event.target.id);
  }

  function updateTitle(newTitle) {
    if (selectedNote) {
      selectedNote.title = newTitle;
      currentNote.set(selectedNote);
    }
  }
</script>

<aside class="sidebar">
  <h2>Notes:</h2>
  <button onclick={createNote}>New Note</button>
  <ul>
    {#each notesList as note}
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
  <header>
    {#if selectedNote}
      <Title title={selectedNote.title} onTitleChange={updateTitle} />
      <ul>
        <li>
          ID: {selectedNote.id}
        </li>
      </ul>
    {:else}
      <h1>Create or select a new note</h1>
      <p>A powerful block-styled editor</p>
    {/if}
    <Editor></Editor>
  </header>
</main>

<style>
  .container {
    max-width: 50%;
    min-width: 45em;
    margin: 0 auto;
    margin-left: 20em;
    padding: 1rem;
  }
  .sidebar {
    position: absolute;
    left: 0;
    top: 0;
    min-width: 15em;
    height: 100%;
    background-color: aliceblue;
    padding: 1em;
  }
</style>
