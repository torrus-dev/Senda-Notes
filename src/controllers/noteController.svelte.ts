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

class NoteController {
  notes = $state<Note[]>([]);
  activeNoteId = $state<string | null>(null);
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.notes = loadNotesFromStorage();
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
        n.id === parentId ? { ...n, children: [...n.children, note.id] } : n,
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
    this.requireNote(id);
    const idsToDelete = new Set([id, ...getDescendants(this.notes, id)]);
    const remainingNotes = this.notes.filter(
      (note) => !idsToDelete.has(note.id),
    );
    this.notes = remainingNotes.map((note) => {
      if (note.children.some((child) => idsToDelete.has(child))) {
        return updateModifiedMetadata({
          ...note,
          children: note.children.filter((child) => !idsToDelete.has(child)),
        });
      }
      return note;
    });

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

    if (newParentId) {
      this.requireNote(newParentId, "New parent note");
      if (newParentId === noteId) {
        throw new Error("Cannot move note to itself");
      }
      if (this.wouldCreateCycle(newParentId, noteId)) {
        throw new Error("Cannot move note to its own descendant");
      }
    }

    this.notes = moveNoteInTree(
      this.notes,
      noteId,
      newParentId,
      position,
      this.getNoteById,
      (updatedNote) => updateModifiedMetadata(updatedNote),
    );

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
