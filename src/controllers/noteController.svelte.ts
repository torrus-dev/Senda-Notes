// noteController.svelte.ts
import { FocusTarget } from "@projectTypes/focusTypes";
import type { Note } from "@projectTypes/noteTypes";

import { focusController } from "@controllers/focusController.svelte";
import {
   createDefaultMetadata,
   generateUniqueTitle,
   getDescendants,
   sanitizeTitle,
   updateModifiedMetadata,
} from "@utils/noteUtils";
import { loadNotesFromStorage, saveNotesToStorage } from "@utils/storage";

class NoteController {
   notes = $state<Note[]>([]);
   activeNoteId = $state<string | null>(null);
   private saveTimeout: ReturnType<typeof setTimeout> | null = null;

   constructor() {
      this.notes = loadNotesFromStorage();
      console.log("notas cargadas: ", $state.snapshot(this.notes));
      this.setupAutoSave();
   }

   private setupAutoSave() {
      $effect.root(() => {
         $effect(() => {
            const currentNotes = [...this.notes];
            if (this.saveTimeout) {
               clearTimeout(this.saveTimeout);
            }
            this.saveTimeout = setTimeout(() => {
               saveNotesToStorage(currentNotes);
               this.saveTimeout = null;
            }, 5000);

            return () => {
               if (this.saveTimeout) {
                  clearTimeout(this.saveTimeout);
               }
            };
         });
      });
   }

   forceImmediateSave() {
      if (this.saveTimeout) {
         clearTimeout(this.saveTimeout);
      }
      saveNotesToStorage(this.notes);
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

      this.activeNoteId = note.id;
      focusController.requestFocus(FocusTarget.TITLE);
      this.forceImmediateSave();
   };

   // Eliminar 'private' para permitir llamadas externas
   updateNote = (id: string, updates: Partial<Note>): void => {
      this.requireNote(id);
      const STRUCTURAL_FIELDS: (keyof Note)[] = ["title", "icon", "properties"];

      // Validación corregida para tipos estrictos
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

      this.updateNoteById(id, (existing) => ({
         ...existing,
         ...validUpdates,
      }));

      // Verificación correcta de cambios estructurales
      const hasStructuralChanges = STRUCTURAL_FIELDS.some(
         (field) => field in validUpdates,
      );

      if (hasStructuralChanges) {
         this.forceImmediateSave();
      }
   };

   deleteNote = (id: string): void => {
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
      if (this.activeNoteId && idsToDelete.has(this.activeNoteId)) {
         this.activeNoteId = null;
      }

      this.forceImmediateSave();
   };

   moveNoteToPosition = (
      noteId: string,
      newParentId: string | undefined,
      position: number,
   ): void => {
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

      this.forceImmediateSave();
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
      return Math.max(0, Math.min(adjusted, maxLength - 1)); // Clamping correcto
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

   getActiveNote = (): Note | null => {
      if (!this.activeNoteId) return null;
      const note = this.getNoteById(this.activeNoteId);
      if (!note) {
         console.warn("Active note was removed, cleaning reference");
         this.activeNoteId = null;
         return null;
      }
      return note;
   };

   getRootNotes = (): Note[] => this.notes.filter((note) => !note.parentId);

   setActiveNote = (id: string): void => {
      this.requireNote(id);
      this.activeNoteId = id;
   };

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
      const descendants = getDescendants(this.notes, noteId);
      return descendants.length;
   };
}

export let noteController = $state(new NoteController());
