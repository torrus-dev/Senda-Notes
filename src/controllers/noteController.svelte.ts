import { FocusTarget } from "@projectTypes/focusTypes";
import type { Note } from "@projectTypes/noteTypes";

import { noteStore } from "@stores/noteStore.svelte";
import {
   createDefaultMetadata,
   generateUniqueTitle,
   sanitizeTitle,
   updateModifiedMetadata,
} from "@utils/noteUtils";

import { focusController } from "@controllers/focusController.svelte";
import { noteTreeController } from "@controllers//noteTreeController.svelte";
import { noteQueryController } from "@controllers//noteQueryController.svelte";
import { workspace } from "@controllers/workspaceController.svelte";

class NoteController {
   createNote = (parentId?: string | undefined): void => {
      if (typeof parentId === "string") {
         noteQueryController.requireNote(parentId, "Parent note");
      }

      const newNote: Note = {
         id: crypto.randomUUID(),
         title: generateUniqueTitle(noteStore.getAllNotes()),
         children: [],
         content: "",
         metadata: createDefaultMetadata(),
         properties: [],
         parentId: typeof parentId === "string" ? parentId : undefined,
      };

      noteStore.createNote(newNote);

      if (typeof parentId === "string") {
         // Actualizamos el array de notas para agregar el ID de la nueva nota al padre
         noteStore.updateNotes((notes) =>
            notes.map((n) =>
               n.id === parentId
                  ? { ...n, children: [...n.children, newNote.id] }
                  : n,
            ),
         );
      }

      workspace.setActiveNoteId(newNote.id);
      focusController.requestFocus(FocusTarget.TITLE);
   };

   updateNote = (noteId: string, updates: Partial<Note>): void => {
      const note = noteQueryController.getNoteById(noteId);
      if (!note) return;
      console.log("updating note in crontroller");

      // Actualizar la nota inmediatamente
      noteStore.updateNoteById(noteId, (existingNote) => ({
         ...existingNote,
         ...updates,
      }));
   };

   updateNoteContent = (noteId: string, content: string): void => {
      this.updateNote(noteId, { content: content });
   };
   updateNoteTitle = (noteId: string, title: string): void => {
      this.updateNote(noteId, { title: sanitizeTitle(title) });
   };

   deleteNote = (id: string): void => {
      // Nos aseguramos de que la nota existe.
      noteQueryController.requireNote(id);

      // Recopilamos recursivamente los IDs de la nota y todos sus descendientes usando parentId.
      const idsToDelete = noteTreeController.getDescendantIds(id);
      idsToDelete.add(id);

      // Filtramos las notas eliminando las que están en idsToDelete.
      noteStore.updateNotes((notes) =>
         notes.filter((note) => !idsToDelete.has(note.id)),
      );

      // Actualizamos el array children de las notas restantes (por si algún padre referenciaba notas eliminadas)
      noteStore.updateNotes((notes) =>
         notes.map((note) =>
            note.children.some((childId) => idsToDelete.has(childId))
               ? updateModifiedMetadata({
                    ...note,
                    children: note.children.filter(
                       (childId) => !idsToDelete.has(childId),
                    ),
                 })
               : note,
         ),
      );

      // Si la nota activa fue borrada, se limpia la referencia.
      const activeNoteId = workspace.getActiveNoteId();
      if (activeNoteId && idsToDelete.has(activeNoteId)) {
         workspace.unsetActiveNoteId();
      }
   };
}

export let noteController = $state(new NoteController());
