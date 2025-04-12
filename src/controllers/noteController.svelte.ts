// noteController.svelte.ts
import { FocusTarget } from "@projectTypes/focusTypes";
import type { Note } from "@projectTypes/noteTypes";

import { focusController } from "@controllers/focusController.svelte";
import {
   createDefaultMetadata,
   generateUniqueTitle,
   getDescendantsId,
   sanitizeTitle,
   updateModifiedMetadata,
} from "@utils/noteUtils";
import { loadNotesFromStorage, saveNotesToStorage } from "@utils/storage";
import { workspace } from "./workspaceController.svelte";

class NoteController {
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

   private processPendingContentUpdates() {
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
   updateNoteContentWithDelay(noteId: string, content: string): void {
      this.requireNote(noteId);

      // Si la nota no es la activa, guardar inmediatamente sin delay
      if (noteId !== workspace.getActiveNoteId()) {
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
   private updateNoteById = (
      id: string,
      updater: (note: Note) => Note,
   ): void => {
      const index = this.notes.findIndex((n) => n.id === id);
      if (index !== -1) {
         this.notes[index] = updateModifiedMetadata(updater(this.notes[index]));
      }
   };

   private requireNote = (id: string, context: string = "Note"): Note => {
      const note = this.getNoteById(id);
      if (!note) throw new Error(`${context} ${id} not found`);
      return note;
   };

   private wouldCreateCycle = (parentId: string, childId: string): boolean => {
      let current = this.getNoteById(parentId);
      while (current?.parentId) {
         if (current.parentId === childId) return true;
         current = this.getNoteById(current.parentId);
      }
      return false;
   };

   createNote = (parentId?: string | undefined, position?: number): void => {
      // Guardar cualquier contenido pendiente antes de crear una nueva nota
      this.forceSave();

      if (typeof parentId === "string") {
         this.requireNote(parentId, "Parent note");
      }

      const note: Note = {
         id: crypto.randomUUID(),
         title: generateUniqueTitle(this.notes),
         children: [],
         content: "",
         metadata: createDefaultMetadata(),
         properties: [],
         parentId: typeof parentId === "string" ? parentId : undefined,
      };

      this.notes = [...this.notes, note];

      if (typeof parentId === "string") {
         // Actualizamos el array de notas para agregar el ID de la nueva nota al padre
         this.notes = this.notes.map((n) =>
            n.id === parentId
               ? { ...n, children: [...n.children, note.id] }
               : n,
         );
      }

      workspace.setActiveNoteId(note.id);
      focusController.requestFocus(FocusTarget.TITLE);
      this.saveNotes();
   };

   // Método para actualización general de notas (guardado inmediato)
   updateNote = (noteId: string, updates: Partial<Note>): void => {
      this.requireNote(noteId);

      // Si solo hay una actualización de contenido y la nota es la activa,
      // delegamos al método con delay
      if (
         Object.keys(updates).length === 1 &&
         "content" in updates &&
         typeof updates.content === "string" &&
         noteId === workspace.getActiveNoteId()
      ) {
         this.updateNoteContentWithDelay(noteId, updates.content);
         return;
      }

      // Validación para tipos estrictos
      const validUpdates = Object.fromEntries(
         Object.entries(updates)
            .filter(([key, value]) => {
               if (key === "title") return typeof value === "string";
               if (["icon", "content"].includes(key))
                  return typeof value === "string";
               if (key === "properties") return Array.isArray(value);
               return false;
            })
            .map(([key, value]) => [
               key,
               key === "title" ? sanitizeTitle(value as string) : value,
            ]),
      );

      if (Object.keys(validUpdates).length === 0) return;

      // Eliminar cualquier actualización pendiente para esta nota si estamos
      // sobrescribiendo el contenido con una actualización inmediata
      if ("content" in validUpdates) {
         this.pendingContentUpdates.delete(noteId);

         // Cancelar el timeout si era para esta nota
         if (
            noteId === workspace.getActiveNoteId() &&
            this.contentSaveTimeout
         ) {
            clearTimeout(this.contentSaveTimeout);
            this.contentSaveTimeout = null;
         }
      }

      // Actualizar la nota inmediatamente
      this.updateNoteById(noteId, (existing) => ({
         ...existing,
         ...validUpdates,
      }));

      this.saveNotes();
   };

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

   deleteNote = (id: string): void => {
      // Guardar cualquier contenido pendiente antes de eliminar notas
      this.forceSave();

      // Nos aseguramos de que la nota existe.
      this.requireNote(id);

      // Recopilamos recursivamente los IDs de la nota y todos sus descendientes usando parentId.
      const idsToDelete = new Set<string>();
      const collectDescendants = (noteId: string) => {
         idsToDelete.add(noteId);
         this.notes.forEach((note) => {
            if (note.parentId === noteId) {
               collectDescendants(note.id);
            }
         });
      };
      collectDescendants(id);

      // Eliminar cualquier actualización pendiente para estas notas
      idsToDelete.forEach((noteId) => {
         this.pendingContentUpdates.delete(noteId);
      });

      // Filtramos las notas eliminando las que están en idsToDelete.
      this.notes = this.notes.filter((note) => !idsToDelete.has(note.id));

      // Actualizamos el array children de las notas restantes (por si algún padre referenciaba notas eliminadas)
      this.notes = this.notes.map((n) =>
         n.children.some((childId) => idsToDelete.has(childId))
            ? updateModifiedMetadata({
                 ...n,
                 children: n.children.filter(
                    (childId) => !idsToDelete.has(childId),
                 ),
              })
            : n,
      );

      // Si la nota activa fue borrada, se limpia la referencia.
      const activeNoteId = workspace.getActiveNoteId();
      if (activeNoteId && idsToDelete.has(activeNoteId)) {
         workspace.unsetActiveNoteId();
      }

      this.saveNotes();
   };

   moveNoteToPosition = (
      noteId: string,
      newParentId: string | undefined,
      position: number,
   ): void => {
      // Guardar cualquier contenido pendiente antes de reorganizar notas
      this.forceSave();

      const note = this.requireNote(noteId);

      // Validaciones previas
      if (newParentId) {
         this.validateParentRelationship(newParentId, noteId);
      }

      // 1. Eliminar referencia del padre anterior
      this.removeFromPreviousParent(note);

      // 2. Actualizar parentId de la nota
      this.updateNoteParentId(noteId, newParentId);
      const updatedNote = this.getNoteById(noteId)!;

      // 3. Insertar en nueva ubicación
      if (newParentId) {
         this.insertIntoParent(newParentId, updatedNote.id, position);
      } else {
         this.insertIntoRoot(updatedNote, position);
      }

      this.saveNotes();
   };

   /* ----------------- Funciones auxiliares ----------------- */

   private validateParentRelationship(
      newParentId: string,
      noteId: string,
   ): void {
      this.requireNote(newParentId, "New parent note");
      if (newParentId === noteId) {
         throw new Error("Cannot move note to itself");
      }
      if (this.wouldCreateCycle(newParentId, noteId)) {
         throw new Error("Cannot move note to its own descendant");
      }
   }

   private removeFromPreviousParent(note: Note): void {
      if (note.parentId) {
         this.updateParentChildren(note.parentId, (children) =>
            children.filter((id) => id !== note.id),
         );
      }
   }

   private updateNoteParentId(
      noteId: string,
      newParentId: string | undefined,
   ): void {
      this.notes = this.notes.map((n) =>
         n.id === noteId
            ? updateModifiedMetadata({ ...n, parentId: newParentId })
            : n,
      );
   }

   private insertIntoParent(
      parentId: string,
      noteId: string,
      position: number,
   ): void {
      this.updateParentChildren(parentId, (children) => {
         const filtered = children.filter((id) => id !== noteId);
         const originalIndex = children.indexOf(noteId);
         const adjustedPosition = this.getAdjustedPosition(
            originalIndex,
            position,
            filtered.length,
         );

         return [
            ...filtered.slice(0, adjustedPosition),
            noteId,
            ...filtered.slice(adjustedPosition),
         ];
      });
   }

   private insertIntoRoot(note: Note, position: number): void {
      const rootNotes = this.getRootNotes().filter((n) => n.id !== note.id);
      const originalIndex = rootNotes.findIndex((n) => n.id === note.id);
      const adjustedPosition = this.getAdjustedPosition(
         originalIndex,
         position,
         rootNotes.length,
      );

      const newRootNotes = [
         ...rootNotes.slice(0, adjustedPosition),
         note,
         ...rootNotes.slice(adjustedPosition),
      ];

      this.notes = [...newRootNotes, ...this.notes.filter((n) => n.parentId)];
   }

   private getAdjustedPosition(
      originalIndex: number,
      targetPosition: number,
      maxLength: number,
   ): number {
      let adjusted = targetPosition;
      if (originalIndex !== -1 && originalIndex < targetPosition) {
         adjusted = targetPosition - 1; // Ajuste por movimiento dentro del mismo contenedor
      }
      return Math.max(0, Math.min(adjusted, maxLength)); // Clamping correcto
   }

   private updateParentChildren(
      parentId: string,
      updateFn: (children: string[]) => string[],
   ): void {
      this.notes = this.notes.map((n) =>
         n.id === parentId
            ? updateModifiedMetadata({ ...n, children: updateFn(n.children) })
            : n,
      );
   }

   getNoteById = (id: string): Note | undefined =>
      this.notes.find((note) => note.id === id);

   getTitleById = (id: string): string | undefined => {
      const note = this.getNoteById(id);
      if (note) {
         return note.title;
      } else {
         return undefined;
      }
   };

   getActiveNote = (): Note | undefined => {
      const activeNoteId = workspace.getActiveNoteId();
      return activeNoteId ? this.getNoteById(activeNoteId) : undefined;
   };

   getRootNotes = (): Note[] => this.notes.filter((note) => !note.parentId);

   getBreadcrumbPath(noteId: string): Array<{ id: string; title: string }> {
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

   getNoteCount = (): number => this.notes.length;

   getChildrenCount = (noteId: string): number => {
      const note = this.getNoteById(noteId);
      if (!note) return 0;
      const descendants = getDescendantsId(this.notes, noteId);
      return descendants.length;
   };
}

export let noteController = $state(new NoteController());
