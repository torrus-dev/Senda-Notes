<script>
  import Title from "./Title.svelte";
  import { noteController } from "./noteController.svelte";
  import Editor from "./Editor.svelte";

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
    <button onclick={noteController.createNote}>New Note</button>
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
    <header>
      {#if activeNote}
        <Title title={activeNote.title} {onTitleChange} />
        <ul>
          <li>
            ID: {activeNote.id}
          </li>
          {#each activeNote.properties as property}
            <li>{property.name} - {property.value}</li>
          {/each}
        </ul>
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
  </main>
</div>

<style>
  .layout {
    display: flex;
  }
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
