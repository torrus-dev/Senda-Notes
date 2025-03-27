// noteController.svelte.ts
import { FocusTarget } from "../types/types";
import type { Note } from "../types/noteTypes";

import { focusController } from "./focusController.svelte";
import {
   createDefaultMetadata,
   generateUniqueTitle,
   getDescendants,
   sanitizeTitle,
   updateModifiedMetadata,
} from "../lib/utils/noteUtils";
import { loadNotesFromStorage, saveNotesToStorage } from "../lib/utils/storage";
import { moveNoteInTree } from "./noteMovementController";
import { log } from "console";

class NoteController {
   notes = $state<Note[]>([]);
   activeNoteId = $state<string | null>(null);
   private saveTimeout: ReturnType<typeof setTimeout> | null = null;

   constructor() {
      this.notes = loadNotesFromStorage();
      console.log($state.snapshot(this.notes));
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

   createNote = (parentId?: string | null, position?: number): void => {
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

   updateNote = (id: string, updates: Partial<Note>): void => {
      const note = this.requireNote(id);
      const STRUCTURAL_FIELDS: (keyof Note)[] = ["title", "icon", "properties"];
      const validUpdates: Partial<Note> = {};

      if (updates.title && typeof updates.title === "string") {
         validUpdates.title = sanitizeTitle(updates.title);
      }
      if (updates.icon && typeof updates.icon === "string") {
         validUpdates.icon = updates.icon;
      }
      if (updates.content && typeof updates.content === "string") {
         validUpdates.content = updates.content;
      }
      if (updates.properties && Array.isArray(updates.properties)) {
         validUpdates.properties = updates.properties;
      }

      if (Object.keys(validUpdates).length === 0) return;

      this.updateNoteById(id, (existingNote) => ({
         ...existingNote,
         ...validUpdates,
         title: validUpdates.title ?? existingNote.title,
         properties: validUpdates.properties ?? existingNote.properties,
      }));

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
      this.notes = this.notes.map((note) => {
         if (note.children.some((childId) => idsToDelete.has(childId))) {
            return updateModifiedMetadata({
               ...note,
               children: note.children.filter(
                  (childId) => !idsToDelete.has(childId),
               ),
            });
         }
         return note;
      });

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
      // Validamos que la nota exista
      const note = this.requireNote(noteId);

      // Si se especifica un nuevo padre, validamos su existencia y evitamos ciclos o asignarla a sí misma
      if (newParentId) {
         this.requireNote(newParentId, "New parent note");
         if (newParentId === noteId) {
            throw new Error("Cannot move note to itself");
         }
         if (this.wouldCreateCycle(newParentId, noteId)) {
            throw new Error("Cannot move note to its own descendant");
         }
      }

      // Eliminamos la referencia de la nota en el padre actual (si la tiene)
      if (note.parentId) {
         this.notes = this.notes.map((n) => {
            if (n.id === note.parentId) {
               return updateModifiedMetadata({
                  ...n,
                  children: n.children.filter((childId) => childId !== noteId),
               });
            }
            return n;
         });
      }

      // Actualizamos el parentId de la nota a mover
      this.notes = this.notes.map((n) =>
         n.id === noteId
            ? updateModifiedMetadata({ ...n, parentId: newParentId })
            : n,
      );

      // Si se asigna un nuevo padre, actualizamos su array de children
      if (newParentId) {
         this.notes = this.notes.map((n) => {
            if (n.id === newParentId) {
               // Filtramos para evitar duplicados
               const filteredChildren = n.children.filter(
                  (childId) => childId !== noteId,
               );
               // Si la nota se movía dentro del mismo contenedor y estaba antes que la posición de destino,
               // restamos 1 para ajustar el índice.
               const originalIndex = n.children.indexOf(noteId);
               let targetPosition = position;
               if (originalIndex !== -1 && originalIndex < position) {
                  targetPosition = position - 1;
               }
               const clampedPosition = Math.max(
                  0,
                  Math.min(targetPosition, filteredChildren.length),
               );
               filteredChildren.splice(clampedPosition, 0, noteId);
               return updateModifiedMetadata({
                  ...n,
                  children: filteredChildren,
               });
            }
            return n;
         });
      } else {
         // Mover la nota a la raíz.
         // Utilizamos getRootNotes() para obtener las notas sin padre
         const rootNotes = this.getRootNotes();
         const originalIndex = rootNotes.findIndex((n) => n.id === noteId);
         // Eliminamos la nota del array de raíz
         const filteredRootNotes = rootNotes.filter((n) => n.id !== noteId);
         let targetPosition = position;
         if (originalIndex !== -1 && originalIndex < position) {
            targetPosition = position - 1;
         }
         const clampedPosition = Math.max(
            0,
            Math.min(targetPosition, filteredRootNotes.length),
         );
         filteredRootNotes.splice(clampedPosition, 0, note);
         // Reconstruimos el array global:
         // - Mantenemos las notas raíz reordenadas
         // - Y las notas con padre se mantienen en el resto del array
         const nonRootNotes = this.notes.filter((n) => n.parentId);
         this.notes = [...filteredRootNotes, ...nonRootNotes];
      }

      this.forceImmediateSave();
   };

   getNoteById = (id: string): Note | undefined =>
      this.notes.find((note) => note.id === id);

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
