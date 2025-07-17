import { Note } from "@domain/Note";
import { PersistentLocalStorageModel } from "@model/persistentLocalStorageModel.svelte";

interface NoteData {
   notes: any[]; // Objetos planos para persistencia
}

/**
 * Repositorio para comandos (operaciones que modifican estado)
 */
export class NoteRepository extends PersistentLocalStorageModel<NoteData> {
   constructor() {
      super("notes");
   }

   protected getDefaultData(): NoteData {
      return { notes: [] };
   }

   protected deserializeData(data: any): NoteData {
      if (!data.notes || !Array.isArray(data.notes)) {
         return { notes: [] };
      }
      return data;
   }

   /**
    * Crea una nueva nota
    */
   create(note: Note): void {
      this.data.notes.push(note.toPlainObject());
   }

   /**
    * Actualiza una nota existente
    */
   update(noteId: string, updatedNote: Note): void {
      const index = this.data.notes.findIndex((n) => n.id === noteId);
      if (index !== -1) {
         this.data.notes[index] = updatedNote.toPlainObject();
      }
   }

   /**
    * Elimina una nota
    */
   delete(noteId: string): void {
      this.data.notes = this.data.notes.filter((n) => n.id !== noteId);
   }

   /**
    * Elimina múltiples notas
    */
   deleteMany(noteIds: Set<string>): void {
      this.data.notes = this.data.notes.filter((n) => !noteIds.has(n.id));
   }

   /**
    * Actualiza múltiples notas en una operación
    */
   updateMany(updates: Map<string, Note>): void {
      this.data.notes = this.data.notes.map((noteData) => {
         const updatedNote = updates.get(noteData.id);
         return updatedNote ? updatedNote.toPlainObject() : noteData;
      });
   }

   /**
    * Reemplaza todo el conjunto de notas
    */
   replaceAll(notes: Note[]): void {
      this.data.notes = notes.map((note) => note.toPlainObject());
   }

   /**
    * Ejecuta una operación batch con múltiples cambios
    */
   batch(operations: () => void): void {
      // Envuelve las operaciones para que se ejecuten juntas
      // La implementación real de persistencia se encargará del guardado
      operations();
   }

   /**
    * Obtiene todos los objetos planos (para el QueryRepository)
    */
   getAllPlainObjects(): any[] {
      return this.data.notes;
   }
}
