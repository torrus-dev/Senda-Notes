import { DateTime } from "luxon";
import type { Note } from "../../types/noteTypes";

export function loadNotesFromStorage(): Note[] {
  const stored = localStorage.getItem("NoteList");
  if (stored) {
    try {
      const parsedNotes = JSON.parse(stored);
      // Convertir los campos `created` y `modified` a instancias de DateTime
      return parsedNotes.map((note: any) => ({
        ...note,
        metadata: {
          ...note.metadata,
          created: DateTime.fromISO(note.metadata.created),
          modified: DateTime.fromISO(note.metadata.modified),
        },
      }));
    } catch (error) {
      console.error("Error al parsear NoteList desde localStorage:", error);
      return [];
    }
  }
  return [];
}

export function saveNotesToStorage(notes: Note[]): void {
  try {
    // Convertir los campos `created` y `modified` a cadenas ISO antes de guardar
    const serializedNotes = notes.map((note) => ({
      ...note,
      metadata: {
        ...note.metadata,
        created: note.metadata.created.toISO(),
        modified: note.metadata.modified.toISO(),
      },
    }));
    localStorage.setItem("NoteList", JSON.stringify(serializedNotes));
  } catch (error) {
    console.error("Error al guardar NoteList en localStorage:", error);
  }
}
