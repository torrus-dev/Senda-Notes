<script>
  import Title from "../components/Title.svelte";
  import Editor from "../components/Editor.svelte";
  import Properties from "../components/Properties.svelte";
  import { noteController } from "../noteController.svelte";

  const activeNote = $derived(noteController.getActiveNote());
</script>

<main class="overflow-auto">
  {#if activeNote}
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
