import { Editor } from "@tiptap/core";

// Estado y tipos para el Property Editor
export interface PropertyEditorState {
   isOpen: boolean;
   noteId: string | null;
   propertyId: string | null;
}

// Tipos para pestañas (tabs) y ventanas
export interface Tab {
   id: string;
   noteId: string;
   title: string;
}

export interface Window {
   id: string;
   tabs: Tab[];
   activeTabId: string | null;
}

// Estado global del workspace
export interface WorkspaceState {
   propertyEditor: PropertyEditorState;
   windows: Window[];
   activeWindowId: string | null;
   modal: {
      isOpen: boolean;
      content: any;
   };
   sidebar: {
      isOpen: boolean;
      width: number | null;
   };
   activeNoteId: string | undefined;
   previousActiveNoteId: string | undefined;
}

export interface PersistedWorkspaceState {
   /** Estado persistente de la sidebar */
   sidebar: WorkspaceState["sidebar"];
}
