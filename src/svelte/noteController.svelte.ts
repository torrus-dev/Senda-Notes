import type { Note, Property } from "./types/notes";

class NoteController {
  notes = $state<Note[]>([]);
  activeNoteId = $state<string | null>(null);

  constructor() {
    const noteList = localStorage.getItem("NoteList");
    if (noteList) {
      this.notes = JSON.parse(noteList);
    }
    $effect.root(() => {
      $effect(() => {
        if (this.notes) {
          this.saveToLocalStorage();
        }
      });
    });
  }

  getNoteById = (id: string) => {
    return this.notes.find((note) => note.id === id);
  };

  newNoteTitle = () => {
    if (!this.notes.some((note) => note.title === "Nota Nueva")) {
      return "Nota Nueva";
    }
    let index = 1;
    while (this.notes.some((note) => note.title === `Nota Nueva ${index}`)) {
      index++;
    }
    return `Nota Nueva ${index}`;
  };

  createNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: this.newNoteTitle(),
      content: "",
      metadata: this.fillNonUserProperties(),
      properties: [],
    };
    this.notes = [...this.notes, newNote];
    this.saveToLocalStorage();
    this.activeNoteId = newNote.id;
  };

  fillNonUserProperties = (): Property[] => {
    return [
      { name: "created", value: this.currentDate(), type: "datetime" },
      { name: "modified", value: this.currentDate(), type: "datetime" }
    ];
  };

  currentDate = (): string => {
    return new Date().toISOString();
  };

  updateNote(id: string, updates: Partial<Note>) {
    this.notes = this.notes.map((note) => {
      if (note.id === id) {
        const updatedMetadata = note.metadata.map((prop) =>
          prop.name === "modified"
            ? { ...prop, value: new Date().toISOString() }
            : prop
        );

        return {
          ...note,
          ...updates,
          metadata: updatedMetadata,
          ...(updates.properties && {
            properties: [...updates.properties],
          }),
        };
      }
      return note;
    });
  }

  getActiveNote = () => {
    return this.notes.find((note) => note.id === this.activeNoteId);
  };

  saveToLocalStorage() {
    localStorage.setItem("NoteList", JSON.stringify(this.notes));
  }

  setActiveNote = (id: string) => {
    this.activeNoteId = id;
  };

  deleteNote = (id: string) => {
    this.notes = this.notes.filter((note) => note.id !== id);
    if (this.activeNoteId === id) {
      this.activeNoteId = null;
    }
  };

  sanitizeTitle(title: string) {
    return title.replace(/[\n\r]+/g, "").slice(0, 100);
  }
}

export const noteController = $state(new NoteController());