interface Property {
  name: string;
  value: string | string[] | number | boolean | Date;
  type: "text" | "list" | "number" | "check" | "date" | "datetime";
}

interface Note {
  id: string;
  title: string;
  content: string;
  properties: Property[];
}


export class NoteController {
  notes = $state(<Note[]>[])
  activeNoteId = $state<string | null>(null);

  constructor() {
    const noteList = localStorage.getItem("NoteList");
    if (noteList) {
      this.notes = JSON.parse(noteList);
    }
  }

  getNoteById = (id: string) => {
    return this.notes.find((note) => note.id === id);
  }

  newNoteTitle = () => {
    if (!this.notes.some((note) => note.title === "Nota Nueva")) {
      return "Nota Nueva";
    }
    let index = 1;
    while (this.notes.some((note) => note.title === `Nota Nueva ${index}`)) {
      index++;
    }
    return `Nota Nueva ${index}`;
  }

  createNote = () => {
    const newNote: Note = {
      title: this.newNoteTitle(),
      content: "",
      properties: [
        { name: "created", value: new Date().toISOString(), type: "datetime" },
        { name: "updated", value: new Date().toISOString(), type: "datetime" },
        { name: "tags", value: ["caballo", "gato", "perro"], type: "list" },
      ],
      id: crypto.randomUUID(),
    };
    this.notes = [...this.notes, newNote];
    this.saveToLocalStorage();
    this.activeNoteId = newNote.id;
  }

  updateNote(id: string, updates: Partial<Note>) {
    this.notes = this.notes.map(note => {
      if (note.id === id) {
        // Hacemos una copia profunda de las properties si existen en updates
        if (updates.properties) {
          return {
            ...note,
            ...updates,
            properties: [...updates.properties] // Aseguramos una nueva instancia del array
          };
        }
        return { ...note, ...updates };
      }
      return note;
    });
    this.saveToLocalStorage();
    console.log("Updated Note:", id, ", new content", updates);
  }

  getActiveNote = () => {
    return this.notes.find((note) => note.id === this.activeNoteId);
  }

  saveToLocalStorage() {
    localStorage.setItem("NoteList", JSON.stringify(this.notes));
  }

  setActiveNote = (id: string) => {
    this.activeNoteId = id;
  }

  deleteNote = (id: string) => {
    // nos quedamos solo con las notas que tengan id distinto a la que se elimina
    this.notes = this.notes.filter(note => note.id !== id);
    this.saveToLocalStorage();
    if (this.activeNoteId === id) {
      this.activeNoteId = null;
    }
  }

  sanitizeTitle(title: string) {
    // Elimina saltos de línea, pero conserva espacios finales y limita a 100 caracteres
    return title.replace(/[\n\r]+/g, "").slice(0, 100);
  }

}

export const noteController = $state(new NoteController());