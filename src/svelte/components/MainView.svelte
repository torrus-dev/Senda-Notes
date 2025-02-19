<script>
  import Title from "../components/Title.svelte";
  import Editor from "../components/Editor.svelte";
  import Properties from "../components/Properties.svelte";
  import DropdownList from "./DropdownList.svelte";
  import { noteController } from "../noteController.svelte";
  import { MoreVerticalIcon, Trash2Icon } from "lucide-svelte";
  import Breadcrumbs from "./Breadcrumbs.svelte";

  const activeNote = $derived(noteController.getActiveNote());
</script>

<main class="overflow-auto">
  {#if activeNote}
    <div class="navbar shadow-sm py-2 px-8 border-neutral border-b-1">
      <div class="flex-1">
        <Breadcrumbs note={activeNote}></Breadcrumbs>
      </div>

      <DropdownList position="end">
        {#snippet label()}
          <MoreVerticalIcon size="20" />
        {/snippet}
        {#snippet menuList()}
          <li>
            <button
              class="text-rose-500"
              onclick={() => {
                noteController.deleteNote(activeNote.id);
              }}
              ><Trash2Icon size="18" />Delete Note
            </button>
          </li>
        {/snippet}
      </DropdownList>
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
