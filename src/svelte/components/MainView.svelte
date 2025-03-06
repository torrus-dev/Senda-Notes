<script>
import { noteController } from "../controllers/noteController.svelte";
import { focusController } from "../controllers/focusController.svelte";

import Title from "../components/Title.svelte";
import Breadcrumbs from "./utils/Breadcrumbs.svelte";
import Properties from "./properties/Properties.svelte";
import ChildNotes from "./ChildNotes.svelte";
import Editor from "./Editor.svelte";
import DropdownList from "./utils/DropdownList.svelte";
import Modal from "./layout/Modal.svelte";

import { FocusTarget } from "../types/types";

import {
  MoreVerticalIcon,
  Trash2Icon,
  PenLineIcon,
  PanelLeft,
} from "lucide-svelte";

const activeNote = $derived(noteController.getActiveNote());
</script>

<main class="overflow-auto">
  <Modal />

  <div
    class="border-border-normal flex min-h-16 w-full items-center border-b-2 px-8 py-2 shadow-sm">
    <PanelLeft></PanelLeft>
    {#if activeNote}
      <DropdownList
        position="end"
        labelClass="outlined"
        menuItems={[
          {
            label: "Rename Note",
            icon: PenLineIcon,
            onClick: () => {
              focusController.requestFocus(FocusTarget.TITLE);
            },
          },
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
    {/if}
  </div>

  {#if activeNote}
    <div class="border-border-normal border-b-2 px-2 py-1 md:px-8">
      <Breadcrumbs note={activeNote}></Breadcrumbs>
    </div>
  {/if}

  <article class="mx-auto w-full max-w-3xl p-3">
    {#if activeNote}
      <header>
        <Title note={activeNote} />
        <Properties note={activeNote} />
        <ChildNotes note={activeNote} />
      </header>
      <Editor noteId={activeNote.id} />
    {:else}
      <header>
        <h1>Create or select a new note</h1>
      </header>
    {/if}
  </article>
</main>
