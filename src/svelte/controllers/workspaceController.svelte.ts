import type { Property, WorkspaceState, Tab, Window } from "../types/types";
import { FocusTarget } from "../types/types";

class WorkspaceController {
  // Estado global del workspace (incluye propertyEditor, ventanas y pestañas)
  state = $state<WorkspaceState>({
    propertyEditor: {
      isVisible: false,
      targetNoteId: null,
      editingProperty: null,
      originalName: null,
    },
    windows: [],
    activeWindowId: null,
    focus: {
      targetId: null,
      timestamp: 0,
    },
  });
  // ========= Métodos para Property Editor =========

  openPropertyEditor = (noteId: string, property: Property | null = null) => {
    this.state.propertyEditor = {
      isVisible: true,
      targetNoteId: noteId,
      editingProperty: property ? { ...property } : null,
      originalName: property?.name || null,
    };
  };

  closePropertyEditor = () => {
    this.state.propertyEditor = {
      isVisible: false,
      targetNoteId: null,
      editingProperty: null,
      originalName: null,
    };
  };

  updateEditingProperty = (updates: Partial<Property>) => {
    if (this.state.propertyEditor.editingProperty) {
      this.state.propertyEditor.editingProperty = {
        ...this.state.propertyEditor.editingProperty,
        ...updates,
      };
    }
  };

  // ========= Métodos para ventanas y pestañas =========

  /**
   * Crea una nueva ventana con una pestaña inicial.
   * La ventana queda activa y se añade al estado global.
   */
  createWindow = (initialNoteId: string, title: string) => {
    const newTab: Tab = {
      id: crypto.randomUUID(),
      noteId: initialNoteId,
      title,
    };
    const newWindow: Window = {
      id: crypto.randomUUID(),
      tabs: [newTab],
      activeTabId: newTab.id,
    };
    this.state.windows = [...this.state.windows, newWindow];
    this.state.activeWindowId = newWindow.id;
    return newWindow;
  };

  /**
   * Añade una nueva pestaña a una ventana existente.
   * La nueva pestaña se marca como activa.
   */
  addTabToWindow = (windowId: string, noteId: string, title: string) => {
    const newTab: Tab = { id: crypto.randomUUID(), noteId, title };
    this.state.windows = this.state.windows.map((win) => {
      if (win.id === windowId) {
        return { ...win, tabs: [...win.tabs, newTab], activeTabId: newTab.id };
      }
      return win;
    });
  };

  /**
   * Cambia la pestaña activa en una ventana determinada.
   */
  switchActiveTab = (windowId: string, tabId: string) => {
    this.state.windows = this.state.windows.map((win) => {
      if (win.id === windowId) {
        return { ...win, activeTabId: tabId };
      }
      return win;
    });
  };

  /**
   * Cierra una pestaña de una ventana. Si la pestaña cerrada era la activa,
   * se asigna como activa la primera pestaña que quede (o null si no hay).
   */
  closeTab = (windowId: string, tabId: string) => {
    this.state.windows = this.state.windows.map((win) => {
      if (win.id === windowId) {
        const updatedTabs = win.tabs.filter((tab) => tab.id !== tabId);
        const updatedActiveTabId =
          win.activeTabId === tabId
            ? updatedTabs.length > 0
              ? updatedTabs[0].id
              : null
            : win.activeTabId;
        return { ...win, tabs: updatedTabs, activeTabId: updatedActiveTabId };
      }
      return win;
    });
  };

  /**
   * Cierra una ventana. Si la ventana cerrada era la activa, se asigna otra
   * ventana activa o se deja en null.
   */
  closeWindow = (windowId: string) => {
    this.state.windows = this.state.windows.filter(
      (win) => win.id !== windowId,
    );
    if (this.state.activeWindowId === windowId) {
      this.state.activeWindowId =
        this.state.windows.length > 0 ? this.state.windows[0].id : null;
    }
  };

  // ========= Métodos para focus =========

  requestFocus = (targetId: FocusTarget) => {
    this.state.focus = {
      targetId,
      timestamp: Date.now(),
    };
  };

  clearFocus = () => {
    this.state.focus = {
      targetId: null,
      timestamp: 0,
    };
  };
}

export const workspace = $state(new WorkspaceController());
