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
    <div class="navbar border-b-(--border) px-8 py-2 shadow-sm">
      <div class="flex-1">
        <Breadcrumbs note={activeNote}></Breadcrumbs>
      </div>

      <DropdownList
        position="end"
        labelClass="border-2 border-(--color-base-300)"
        menuItems={[
          {
            label: "Delete Note",
            icon: Trash2Icon,
            onClick: () => noteController.deleteNote(activeNote.id),
            class: "text-error",
          },
        ]}>
        {#snippet label()}
          <MoreVerticalIcon size="20" />
        {/snippet}
      </DropdownList>
    </div>

    <article class="mx-auto w-3xl p-3">
      <header>
        <Title id={activeNote.id} />
        <Properties note={activeNote} />
        <Editor noteId={activeNote.id} />
      </header>
    </article>
  {:else}
    <article class="mx-auto w-3xl p-3">
      <header>
        <h1>Create or select a new note</h1>
      </header>
    </article>
  {/if}
</main>
