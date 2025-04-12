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
import { workspace } from "./workspaceController.svelte";
import { noteStore } from "@stores/noteStore.svelte";

class NoteController {
   isDataSaved = $derived(noteStore.isDataSaved);
   
   createNote = (parentId?: string | undefined, position?: number): void => {
      // Guardar cualquier contenido pendiente antes de crear una nueva nota
      noteStore.forceSave();

      if (typeof parentId === "string") {
         this.requireNote(parentId, "Parent note");
      }

      const note: Note = {
         id: crypto.randomUUID(),
         title: generateUniqueTitle(noteStore.getNotes()),
         children: [],
         content: "",
         metadata: createDefaultMetadata(),
         properties: [],
         parentId: typeof parentId === "string" ? parentId : undefined,
      };

      noteStore.addNote(note);

      if (typeof parentId === "string") {
         // Actualizamos el array de notas para agregar el ID de la nueva nota al padre
         noteStore.updateNotes((notes) =>
            notes.map((n) =>
               n.id === parentId
                  ? { ...n, children: [...n.children, note.id] }
                  : n,
            ),
         );
      }

      workspace.setActiveNoteId(note.id);
      focusController.requestFocus(FocusTarget.TITLE);
   };

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
         noteStore.updateNoteContentWithDelay(
            noteId,
            updates.content,
            noteId === workspace.getActiveNoteId(),
         );
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

      // Actualizar la nota inmediatamente
      noteStore.updateNoteById(noteId, (existing) => ({
         ...existing,
         ...validUpdates,
      }));
   };

   updateNoteContent = (noteId: string, content: string): void => {
      this.requireNote(noteId);

      // Determinar si es la nota activa
      const isActiveNote = noteId === workspace.getActiveNoteId();

      // Delegar al store
      noteStore.updateNoteContentWithDelay(noteId, content, isActiveNote);
   };

   deleteNote = (id: string): void => {
      // Guardar cualquier contenido pendiente antes de eliminar notas
      noteStore.forceSave();

      // Nos aseguramos de que la nota existe.
      this.requireNote(id);

      // Recopilamos recursivamente los IDs de la nota y todos sus descendientes usando parentId.
      const idsToDelete = new Set<string>();
      const collectDescendants = (noteId: string) => {
         idsToDelete.add(noteId);
         noteStore.getNotes().forEach((note) => {
            if (note.parentId === noteId) {
               collectDescendants(note.id);
            }
         });
      };
      collectDescendants(id);

      // Eliminar cualquier actualización pendiente para estas notas
      noteStore.clearPendingUpdates(idsToDelete);

      // Filtramos las notas eliminando las que están en idsToDelete.
      noteStore.updateNotes((notes) =>
         notes.filter((note) => !idsToDelete.has(note.id)),
      );

      // Actualizamos el array children de las notas restantes (por si algún padre referenciaba notas eliminadas)
      noteStore.updateNotes((notes) =>
         notes.map((n) =>
            n.children.some((childId) => idsToDelete.has(childId))
               ? updateModifiedMetadata({
                    ...n,
                    children: n.children.filter(
                       (childId) => !idsToDelete.has(childId),
                    ),
                 })
               : n,
         ),
      );

      // Si la nota activa fue borrada, se limpia la referencia.
      const activeNoteId = workspace.getActiveNoteId();
      if (activeNoteId && idsToDelete.has(activeNoteId)) {
         workspace.unsetActiveNoteId();
      }
   };

   moveNoteToPosition = (
      noteId: string,
      newParentId: string | undefined,
      position: number,
   ): void => {
      // Guardar cualquier contenido pendiente antes de reorganizar notas
      noteStore.forceSave();

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
   };

   /* ----------------- Funciones auxiliares ----------------- */

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
      noteStore.updateNotes((notes) =>
         notes.map((n) =>
            n.id === noteId
               ? updateModifiedMetadata({ ...n, parentId: newParentId })
               : n,
         ),
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

      const notesWithParents = noteStore.getNotes().filter((n) => n.parentId);
      noteStore.setNotes([...newRootNotes, ...notesWithParents]);
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
      noteStore.updateNotes((notes) =>
         notes.map((n) =>
            n.id === parentId
               ? updateModifiedMetadata({
                    ...n,
                    children: updateFn(n.children),
                 })
               : n,
         ),
      );
   }

   // Métodos de acceso a datos delegados al store
   getNoteById = (id: string): Note | undefined => noteStore.getNoteById(id);

   getTitleById = (id: string): string | undefined => {
      const note = this.getNoteById(id);
      return note ? note.title : undefined;
   };

   getActiveNote = (): Note | undefined => {
      const activeNoteId = workspace.getActiveNoteId();
      return activeNoteId ? this.getNoteById(activeNoteId) : undefined;
   };

   getRootNotes = (): Note[] => noteStore.getRootNotes();

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

   getNoteCount = (): number => noteStore.getNotes().length;

   getChildrenCount = (noteId: string): number => {
      const note = this.getNoteById(noteId);
      if (!note) return 0;
      const descendants = getDescendantsId(noteStore.getNotes(), noteId);
      return descendants.length;
   };
}

export let noteController = $state(new NoteController());
