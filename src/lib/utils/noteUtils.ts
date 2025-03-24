import { DateTime } from "luxon";
import { Note, NoteMetadata } from "../../types/noteTypes";

export function sanitizeTitle(title: string): string {
  return title
    .replace(/[\n\r]+/g, " ")
    .trim()
    .slice(0, 100);
}

export function updateModifiedMetadata(note: Note): Note {
  return {
    ...note,
    metadata: {
      ...note.metadata,
      modified: DateTime.now(),
    },
  };
}

export function createDefaultMetadata(): NoteMetadata {
  return {
    created: DateTime.now(),
    modified: DateTime.now(),
    outgoingLinks: [],
    incomingLinks: [],
    aliases: [],
  };
}

export function generateUniqueTitle(notes: Note[]): string {
  const titleBase = "Nota Nueva";

  const currentTitles = new Set(notes.map((note) => note.title));
  if (!currentTitles.has(titleBase)) return titleBase;
  let index = 1;
  while (currentTitles.has(`${titleBase} ${index}`)) index++;

  return `${titleBase} ${index}`;
}

// -------------------
// Relaciones hijos y padres
// -------------------

export function getDescendants(notes: Note[], parentId: string): string[] {
  const parent = notes.find((note) => note.id === parentId);
  if (!parent) return [];

  return parent.children.reduce((acc: string[], childId) => {
    return [...acc, childId, ...getDescendants(notes, childId)];
  }, []);
}

export function isDescendant(
  notes: Note[],
  descendantId: string,
  ancestorId: string,
): boolean {
  let currentNote = notes.find((note) => note.id === descendantId);
  while (currentNote) {
    if (currentNote.parentId === ancestorId) return true;
    if (!currentNote.parentId) break;
    currentNote = notes.find((note) => {
      if (currentNote) {
        note.id === currentNote.parentId;
      }
    });
  }
  return false;
}
