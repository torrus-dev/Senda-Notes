import { DateTime } from "luxon";
import type { Note } from "@projectTypes/noteTypes";
import type { PersistedWorkspaceState } from "@projectTypes/workspaceTypes";
import type { Settings } from "@projectTypes/settingsTypes";
import type { GlobalProperty, NoteProperty } from "@projectTypes/propertyTypes";

const GLOBAL_PROPERTIES_STORAGE_KEY = "GlobalProperties";
const WORKSPACE_STORAGE_KEY = "WorkspaceState";
const SETTINGS_STORAGE_KEY = "SettingsState";

// GLOBAL PROPERTIES
export function loadGlobalPropertiesFromStorage(): GlobalProperty[] {
   try {
      const stored = localStorage.getItem(GLOBAL_PROPERTIES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
   } catch (error) {
      console.error("Error al cargar propiedades globales:", error);
      return [];
   }
}

export function saveGlobalPropertiesToStorage(
   globalProperties: GlobalProperty[],
): void {
   try {
      localStorage.setItem(
         GLOBAL_PROPERTIES_STORAGE_KEY,
         JSON.stringify(globalProperties),
      );
   } catch (error) {
      console.error("Error al guardar propiedades globales:", error);
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
      showEditorToolbar: false,
      theme: "dark",
      sidebarIsLocked: false,
      showMetadata: false,
      debugLevel: 0,
   };
}
