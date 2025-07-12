import type { Note } from "@projectTypes/core/noteTypes";
import { updateModifiedMetadata } from "@utils/noteUtils";
import { PersistentLocalStorageModel } from "@model/persistentLocalStorageModel.svelte";
import { DateTime } from "luxon";

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

   // Override de deserialización para manejar DateTime
   protected deserializeData(data: any): NoteData {
      if (!data.notes || !Array.isArray(data.notes)) {
         return { notes: [] };
      }

      return {
         notes: data.notes.map((note: any) => ({
            ...note,
            metadata: {
               ...note.metadata,
               created:
                  typeof note.metadata.created === "string"
                     ? DateTime.fromISO(note.metadata.created)
                     : note.metadata.created,
               modified:
                  typeof note.metadata.modified === "string"
                     ? DateTime.fromISO(note.metadata.modified)
                     : note.metadata.modified,
            },
         })),
      };
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
