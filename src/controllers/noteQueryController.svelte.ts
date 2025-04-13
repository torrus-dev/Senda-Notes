import type { Note } from "@projectTypes/noteTypes";
import { noteStore } from "@stores/noteStore.svelte";
import { getDescendantsId } from "@utils/noteUtils";
import { workspace } from "./workspaceController.svelte";

class NoteQueryController {
   // Métodos de acceso a datos delegados al store
   getNoteById = (id: string): Note | undefined => noteStore.getNoteById(id);

   getTitleById = (id: string): string | undefined => {
      const note = this.getNoteById(id);
      return note ? note.title : undefined;
   };

   getActiveNote = (): Note | undefined => {
      const activeNoteId = workspace.getActiveNoteId();
      return activeNoteId ? this.getNoteById(activeNoteId) : undefined;
   };

   getRootNotes = (): Note[] => noteStore.getRootNotes();

   getBreadcrumbArrayFromNoteId(
      noteId: string,
   ): Array<{ id: string; title: string }> {
      const path = [];
      let currentNote = this.getNoteById(noteId);
      while (currentNote) {
         path.unshift({ id: currentNote.id, title: currentNote.title });
         currentNote = currentNote.parentId
            ? this.getNoteById(currentNote.parentId)
            : undefined;
      }
      return path;
   }

   getPathFromNoteId(noteId: string): string {
      const titles = [];
      let currentNote = this.getNoteById(noteId);

      while (currentNote) {
         titles.unshift(currentNote.title);
         currentNote = currentNote.parentId
            ? this.getNoteById(currentNote.parentId)
            : undefined;
      }

      return titles.join("/");
   }

   getNoteCount = (): number => noteStore.getNotes().length;

   getChildrenCount = (noteId: string): number => {
      const note = this.getNoteById(noteId);
      if (!note) return 0;
      const descendants = getDescendantsId(noteStore.getNotes(), noteId);
      return descendants.length;
   };

   // Funciones de validación
   requireNote = (id: string, context: string = "Note"): Note => {
      const note = this.getNoteById(id);
      if (!note) throw new Error(`${context} ${id} not found`);
      return note;
   };
}

export let noteQueryController = $state(new NoteQueryController());
