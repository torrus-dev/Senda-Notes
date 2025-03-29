import { DateTime } from "luxon";
import type { Note } from "../../types/noteTypes";
import type { PersistedWorkspaceState } from "../../types/workspaceTypes"; // Se importa el nuevo tipo
import { Settings } from "../../types/settingsTypes";

const NOTES_STORAGE_KEY = "NoteList";
const WORKSPACE_STORAGE_KEY = "workspaceState";
const SETTINGS_STORAGE_KEY = "settingsState";

// NOTES
export function loadNotesFromStorage(): Note[] {
   const stored = localStorage.getItem(NOTES_STORAGE_KEY);
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
         console.error(
            "Error al parsear",
            NOTES_STORAGE_KEY,
            "desde localStorage:",
            error,
         );
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
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(serializedNotes));
   } catch (error) {
      console.error(
         "Error al guardar",
         NOTES_STORAGE_KEY,
         "en localStorage:",
         error,
      );
   }
}

// WORKSPACE
// Función pura que convierte el estado persistente en un string
export const serializeWorkspaceState = (
   state: PersistedWorkspaceState,
): string => JSON.stringify(state);

// Función pura que, dado un string, devuelve el estado persistente
export const deserializeWorkspaceState = (
   serializedState: string,
): PersistedWorkspaceState => JSON.parse(serializedState);

// Función que guarda el estado persistente en localStorage
export const saveWorkspaceState = (
   state: PersistedWorkspaceState,
   storage: Storage = localStorage,
): PersistedWorkspaceState => {
   const serialized = serializeWorkspaceState(state);
   storage.setItem(WORKSPACE_STORAGE_KEY, serialized);
   return state;
};

export const loadWorkspaceState = (
   storage: Storage = localStorage,
): PersistedWorkspaceState | null => {
   const serialized = storage.getItem(WORKSPACE_STORAGE_KEY);
   return serialized ? deserializeWorkspaceState(serialized) : null;
};

// SETTINGS
export function saveSettingsState(state: Settings) {
   try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state));
   } catch (error) {
      console.error("Error al guardar el estado de configuración:", error);
   }
}

export function loadSettingsState(): Settings {
   try {
      const storedState = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return storedState ? JSON.parse(storedState) : getDefaultSettingsState();
   } catch (error) {
      console.error("Error al cargar el estado de configuración:", error);
      return getDefaultSettingsState();
   }
}

function getDefaultSettingsState(): Settings {
   return {
      showToolbar: false,
      theme: "dark",
      sidebarIsLocked: false,
   };
}
