import { writable, get } from 'svelte/store';

interface Note {
  title: string;
  content: string;
  id: string;
}

export const notes = writable<Note[]>([]);
export const currentNote = writable<Note | null>(null);

function saveToLocalStorage(notes: Note[]) {
  localStorage.setItem("NoteList", JSON.stringify(notes));
}

export function loadNotes() {
  const noteList = localStorage.getItem("NoteList");
  if (noteList) {
    notes.set(JSON.parse(noteList));
  }
}

function newNoteTitle(notes: Note[]) {
  if (!notes.some((note) => note.title === "Nota Nueva")) {
    return "Nota Nueva";
  }
  let index = 1;
  while (notes.some((note) => note.title === `Nota Nueva ${index}`)) {
    index++;
  }
  return `Nota Nueva ${index}`;
}

export function createNote() {
  notes.update(n => {
    const newNote = {
      title: newNoteTitle(n),
      content: "",
      id: crypto.randomUUID(),
    };
    const newNotes = [...n, newNote];
    saveToLocalStorage(newNotes);
    currentNote.set(newNote);
    return newNotes;
  });
}

export function selectNote(id: string) {
  const currentNotes = get(notes);
  const note = currentNotes.find(n => n.id === id);
  currentNote.set(note || null);
  console.log(get(currentNote))
}

export function deleteNote(id: string) {
  const selectedNote = get(currentNote);
  notes.update(n => {
    const newNotes = n.filter(note => note.id !== id);
    saveToLocalStorage(newNotes);
    if (selectedNote?.id === id) {
      currentNote.set(null);
    }
    return newNotes;
  });
}

// Añadir esta función para actualizar notas
export function updateNote(id: string, updates: Partial<Note>) {
  notes.update(n => {
    const newNotes = n.map(note =>
      note.id === id ? { ...note, ...updates } : note
    );
    saveToLocalStorage(newNotes);
    return newNotes;
  });
}