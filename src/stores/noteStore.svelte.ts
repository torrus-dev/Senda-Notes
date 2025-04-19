import type { Note } from "@projectTypes/noteTypes";
import { loadNotesFromStorage, saveNotesToStorage } from "@utils/storage";
import { updateModifiedMetadata } from "@utils/noteUtils";

class NoteStore {
   private notes = $state<Note[]>([]);

   constructor() {
      this.notes = loadNotesFromStorage();
      console.log("notas cargadas: ", $state.snapshot(this.notes));
   }

   saveNotes() {
      saveNotesToStorage(this.notes);
      console.log("guardando notas");
   }

   // Métodos básicos de acceso a datos
   getNoteById(id: string): Note | undefined {
      return this.notes.find((note) => note.id === id);
   }

   getAllNotes(): Note[] {
      return this.notes;
   }

   setNotes(newNotes: Note[]) {
      this.notes = newNotes;
      this.saveNotes();
   }

   createNote(note: Note): void {
      this.notes = [...this.notes, note];
      this.saveNotes();
   }

   // Actualiza una nota en el array por ID aplicando un updater
   updateNoteById(id: string, updater: (note: Note) => Note): void {
      const index = this.notes.findIndex((n) => n.id === id);
      if (index !== -1) {
         this.notes[index] = updateModifiedMetadata(updater(this.notes[index]));
      }
      this.saveNotes();
   }

   removeNote(id: string): void {
      this.notes = this.notes.filter((note) => note.id !== id);
      this.saveNotes();
   }

   updateNotes(noteUpdater: (notes: Note[]) => Note[]): void {
      this.notes = noteUpdater(this.notes);
      this.saveNotes();
   }

   getRootNotes(): Note[] {
      return this.notes.filter((note) => !note.parentId);
   }
}

export let noteStore = $state(new NoteStore());
