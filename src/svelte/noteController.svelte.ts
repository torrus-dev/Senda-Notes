interface Property {
  name: string;
  value: string | string[] | number | boolean | Date;
  type: "text" | "list" | "number" | "check" | "date" | "datetime";
}

interface Note {
  id: string;
  title: string;
  content: string;
  metadata: Property[]
  properties: Property[];
}

class NoteController {
  notes = $state(<Note[]>[])
  activeNoteId = $state<string | null>(null);

  constructor() {
    const noteList = localStorage.getItem("NoteList");
    if (noteList) {
      this.notes = JSON.parse(noteList);
    }
    $effect.root(() => {
      $effect(() => {
        if (this.notes) {
          this.saveToLocalStorage()
        }
      })
    })
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
      id: crypto.randomUUID(),
      title: this.newNoteTitle(),
      content: "",
      metadata: this.fillNonUserProperties(),
      properties: [],
    };
    this.notes = [...this.notes, newNote];
    this.saveToLocalStorage();
    this.activeNoteId = newNote.id;
  }

  fillNonUserProperties = (): Property[] => {
    return [
      { name: "created", value: this.currentDate(), type: "datetime" },
      { name: "modified", value: this.currentDate(), type: "datetime" },
      { name: "tags", value: ["caballo", "gato", "perro"], type: "list" },
    ];
  }

  currentDate = (): string => {
    return new Date().toISOString();
  }

  // updateNote(id: string, updates: Partial<Note>) {
  //   this.notes = this.notes.map(note => {
  //     if (note.id === id) {
  //       // Hacemos una copia profunda de las properties si existen en updates
  //       if (updates.properties) {
  //         return {
  //           ...note,
  //           ...updates,
  //           properties: [...updates.properties] // Aseguramos una nueva instancia del array
  //         };
  //       }
  //       return { ...note, ...updates };
  //     }
  //     return note;
  //   });
  // }

  updateNote(id: string, updates: Partial<Note>) {
    this.notes = this.notes.map(note => {
      if (note.id === id) {
        // Actualizar la fecha de modificación en metadata
        const updatedMetadata = note.metadata.map(prop =>
          prop.name === "modified"
            ? { ...prop, value: new Date().toISOString() }
            : prop
        );

        return {
          ...note,
          ...updates,
          metadata: updatedMetadata,
          // Si hay updates de properties, asegurar nueva instancia
          ...(updates.properties && {
            properties: [...updates.properties]
          })
        };
      }
      return note;
    });
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