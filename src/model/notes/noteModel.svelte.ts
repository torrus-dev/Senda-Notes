import type { Note } from "@projectTypes/core/noteTypes";
import { updateModifiedMetadata } from "@utils/noteUtils";
import { settingsModel } from "../application/settingsModel.svelte";
import { DateTime } from "luxon";

const NOTES_STORAGE_KEY = "notes";

class NoteModel {
   private notes = $state<Note[]>([]);

   constructor() {
      this.notes = this.loadFromStorage();
      if (settingsModel.debugLevel > 0) {
         console.log("notas cargadas: ", $state.snapshot(this.notes));
      }

      $effect.root(() => {
         $effect(() => {
            this.saveToStorage(this.notes);
            if (settingsModel.debugLevel > 0) {
               console.log("guardando notas", $state.snapshot(this.notes));
            }
         });
      });
   }

   // Métodos de persistencia integrados
   private loadFromStorage(): Note[] {
      const stored = localStorage.getItem(NOTES_STORAGE_KEY);
      if (stored) {
         try {
            const parsedNotes = JSON.parse(stored);
            return parsedNotes.map((note: any) => ({
               ...note,
               metadata: {
                  ...note.metadata,
                  created: DateTime.fromISO(note.metadata.created),
                  modified: DateTime.fromISO(note.metadata.modified),
               },
            }));
         } catch (error) {
            console.error("Error al parsear notas desde localStorage:", error);
            return [];
         }
      }
      return [];
   }

   private saveToStorage(notes: Note[]): void {
      try {
         const serializedNotes = notes.map((note) => ({
            ...note,
            metadata: {
               ...note.metadata,
               created: note.metadata.created.toISO(),
               modified: note.metadata.modified.toISO(),
            },
         }));
         localStorage.setItem(
            NOTES_STORAGE_KEY,
            JSON.stringify(serializedNotes),
         );
      } catch (error) {
         console.error("Error al guardar notas en localStorage:", error);
      }
   }

   // get/set

   getNoteById(id: string): Note | undefined {
      return this.notes.find((note) => note.id === id);
   }

   getAllNotes(): Note[] {
      return this.notes;
   }

   setAllNotes(newNotes: Note[]) {
      this.notes = newNotes;
   }

   // crud
   createNote(note: Note): void {
      this.notes = [...this.notes, note];
   }

   updateNote(id: string, updater: (note: Note) => Note): void {
      const index = this.notes.findIndex((n) => n.id === id);
      if (index !== -1) {
         this.notes[index] = updateModifiedMetadata(updater(this.notes[index]));
      }
   }
   updateAllNotes(updater: (notes: Note[]) => Note[]): void {
      this.notes = updater(this.notes);
   }

   removeNote(id: string): void {
      this.notes = this.notes.filter((note) => note.id !== id);
   }
}

export const noteModel = $state(new NoteModel());
