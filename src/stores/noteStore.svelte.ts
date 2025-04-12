// noteStore.svelte.ts
import type { Note } from "@projectTypes/noteTypes";
import { loadNotesFromStorage, saveNotesToStorage } from "@utils/storage";
import { updateModifiedMetadata } from "@utils/noteUtils";

class NoteStore {
   notes = $state<Note[]>([]);
   isDataSaved = $state(true);
   private contentSaveTimeout: ReturnType<typeof setTimeout> | null = null;
   private pendingContentUpdates = new Map<string, string>();

   constructor() {
      this.notes = loadNotesFromStorage();
      console.log("notas cargadas: ", $state.snapshot(this.notes));

      // Configurar un efecto para guardar automáticamente al cerrar/refrescar la página
      this.setupBeforeUnloadHandler();
   }

   private setupBeforeUnloadHandler() {
      if (typeof window !== "undefined") {
         window.addEventListener("beforeunload", () => {
            this.forceSave();
         });
      }
   }

   saveNotes() {
      saveNotesToStorage(this.notes);
      this.isDataSaved = true;
   }

   saveContentForNote(noteId: string) {
      // Si hay contenido pendiente para esta nota específica, guardarlo
      if (this.pendingContentUpdates.has(noteId)) {
         const pendingContent = this.pendingContentUpdates.get(noteId)!;

         // Aplicar la actualización
         this.updateNoteById(noteId, (note) => ({
            ...note,
            content: pendingContent,
         }));

         // Eliminar de pendientes
         this.pendingContentUpdates.delete(noteId);

         // Si no quedan más pendientes, actualizar estado
         if (this.pendingContentUpdates.size === 0) {
            this.isDataSaved = true;
         }

         // Guardar los cambios
         saveNotesToStorage(this.notes);
      }
   }

   processPendingContentUpdates() {
      if (this.pendingContentUpdates.size === 0) return;

      // Aplicar todos los contenidos pendientes
      this.pendingContentUpdates.forEach((content, noteId) => {
         this.updateNoteById(noteId, (note) => ({
            ...note,
            content,
         }));
      });

      // Limpiar pendientes y guardar
      this.pendingContentUpdates.clear();
      this.saveNotes();
   }

   // Método específico para actualizaciones de contenido con delay
   updateNoteContentWithDelay(
      noteId: string,
      content: string,
      isActiveNote: boolean,
   ): void {
      // Si la nota no es la activa, guardar inmediatamente sin delay
      if (!isActiveNote) {
         this.updateNoteById(noteId, (note) => ({
            ...note,
            content,
         }));
         this.saveNotes();
         return;
      }

      // Marcar que hay datos pendientes de guardar
      this.isDataSaved = false;

      // Almacenar la actualización pendiente (siempre usar la más reciente)
      this.pendingContentUpdates.set(noteId, content);

      // Resetear el temporizador cada vez que se llama
      if (this.contentSaveTimeout) {
         clearTimeout(this.contentSaveTimeout);
      }

      // Configurar el nuevo temporizador
      this.contentSaveTimeout = setTimeout(() => {
         this.saveContentForNote(noteId);
         this.contentSaveTimeout = null;
      }, 5000);
   }

   // Actualiza una nota en el array por ID aplicando un updater
   updateNoteById(id: string, updater: (note: Note) => Note): void {
      const index = this.notes.findIndex((n) => n.id === id);
      if (index !== -1) {
         this.notes[index] = updateModifiedMetadata(updater(this.notes[index]));
      }
   }

   // Método para forzar el guardado inmediato incluyendo las actualizaciones de contenido pendientes
   forceSave(): void {
      // Cancelar cualquier temporizador pendiente
      if (this.contentSaveTimeout) {
         clearTimeout(this.contentSaveTimeout);
         this.contentSaveTimeout = null;
      }

      // Procesar las actualizaciones pendientes
      this.processPendingContentUpdates();
   }

   // Métodos básicos de acceso a datos
   getNoteById(id: string): Note | undefined {
      return this.notes.find((note) => note.id === id);
   }

   getNotes(): Note[] {
      return this.notes;
   }

   setNotes(newNotes: Note[]): void {
      this.notes = newNotes;
      this.saveNotes();
   }

   addNote(note: Note): void {
      this.notes = [...this.notes, note];
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

   // Eliminar contenido pendiente para un conjunto de notas
   clearPendingUpdates(noteIds: Set<string>): void {
      noteIds.forEach((id) => this.pendingContentUpdates.delete(id));
   }

   getRootNotes(): Note[] {
      return this.notes.filter((note) => !note.parentId);
   }
}

export let noteStore = $state(new NoteStore());
