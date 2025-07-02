import type { Note } from "@projectTypes/core/noteTypes";
import { updateModifiedMetadata } from "@utils/noteUtils";
import { PersistentLocalStorageModel } from "@model/persistentLocalStorage.svelte";

interface NoteData {
   notes: Note[];
}

class NoteModel extends PersistentLocalStorageModel<NoteData> {
   constructor() {
      super("notes");
   }

   protected getDefaultData(): NoteData {
      return { notes: [] };
   }

   // get/set

   getNoteById(id: string): Note | undefined {
      return this.data.notes.find((note) => note.id === id);
   }

   getAllNotes(): Note[] {
      return this.data.notes;
   }

   setAllNotes(newNotes: Note[]) {
      this.data.notes = newNotes;
   }

   // crud
   createNote(note: Note): void {
      this.data.notes = [...this.data.notes, note];
   }

   updateNote(id: string, updater: (note: Note) => Note): void {
      const index = this.data.notes.findIndex((n) => n.id === id);
      if (index !== -1) {
         this.data.notes[index] = updateModifiedMetadata(
            updater(this.data.notes[index]),
         );
      }
   }
   updateAllNotes(updater: (notes: Note[]) => Note[]): void {
      this.data.notes = updater(this.data.notes);
   }

   deleteNote(id: string): void {
      this.data.notes = this.data.notes.filter((note) => note.id !== id);
   }
}

export const noteModel = $state(new NoteModel());
