<script>
import Title from "./Title.svelte";
import Properties from "../properties/Properties.svelte";
import ChildNotes from "./ChildNotes.svelte";
import Editor from "./editor/Editor.svelte";
import Toolbar from "./Toolbar.svelte";
import Metadata from "./Metadata.svelte";

let { note } = $props();
</script>

<!-- <Toolbar></Toolbar> -->

<div class="overflow-auto">
  {#if note}
    <Metadata metadata={note.metadata}></Metadata>
  {/if}
  <article class="mx-auto w-full max-w-3xl p-3">
    {#if note}
      <header>
        <Title note={note} />
        <Properties note={note} />
        <ChildNotes note={note} />
      </header>
      <section>
        <Editor noteId={note.id} />
      </section>
    {:else}
      <header>
        <h1>Create or select a new note</h1>
      </header>
    {/if}
  </article>
</div>
