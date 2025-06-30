import type { Note } from "@projectTypes/core/noteTypes";
import { noteModel } from "@model/notes/noteModel.svelte";
import { getDescendantsId } from "@utils/noteUtils";
import { workspaceController } from "@controllers/navigation/noteNavigationController.svelte";

class NoteQueryController {
   getNoteById = noteModel.getNoteById.bind(noteModel);
   getAllNotes = noteModel.getAllNotes.bind(noteModel);

   // Métodos con lógica específica del controlador
   getRootNotes() {
      return noteModel.getAllNotes().filter((note) => !note.parentId);
   }

   getNotesByIdList(idList: string[]): Note[] {
      return idList
         .map(this.getNoteById)
         .filter((note): note is Note => note !== undefined);
   }

   getActiveNote(): Note | undefined {
      const activeNoteId = workspaceController.activeNoteId;
      return activeNoteId ? this.getNoteById(activeNoteId) : undefined;
   }

   getPathAsArray(noteId: string): Array<{ id: string; title: string }> {
      const path: Array<{ id: string; title: string }> = [];
      let currentNote = this.getNoteById(noteId);

      while (currentNote) {
         path.unshift({ id: currentNote.id, title: currentNote.title });
         currentNote = currentNote.parentId
            ? this.getNoteById(currentNote.parentId)
            : undefined;
      }

      return path;
   }

   getPathAsString(noteId: string): string {
      return this.getPathAsArray(noteId)
         .map((p) => p.title)
         .join("/");
   }

   getNoteCount(): number {
      return this.getAllNotes().length;
   }

   getChildrenCount(noteId: string): number {
      const note = this.getNoteById(noteId);
      return note ? getDescendantsId(this.getAllNotes(), noteId).length : 0;
   }

   requireNote(id: string, context = "Note"): Note {
      const note = this.getNoteById(id);
      if (!note) throw new Error(`${context} ${id} not found`);
      return note;
   }
}

export const noteQueryController = new NoteQueryController();
