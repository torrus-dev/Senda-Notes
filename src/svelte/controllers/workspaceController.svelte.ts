import type { WorkspaceState, Tab, Window } from "../types/types";

class WorkspaceController {
  // Estado global del workspace (incluye propertyEditor, ventanas y pestañas)
  state = $state<WorkspaceState>({
    propertyEditor: {
      isOpen: false,
      noteId: null,
      propertyId: null,
    },
    windows: [],
    activeWindowId: null,
    modal: {
      isOpen: false,
      content: undefined,
    },
    sidebar: {
      isOpen: true,
      width: null,
    },
  });

  // Modal

  openModal = (modalContent = undefined) => {
    this.state.modal = {
      isOpen: true,
      content: modalContent,
    };
  };

  closeModal = () => {
    this.state.modal = {
      isOpen: false,
      content: undefined,
    };
  };

  isModalOpen = () => {
    return this.state.modal.isOpen;
  };

  getModalContent = () => {
    return this.state.modal.content;
  };

  // ----- Sidebar --> Apañarlo y añadir persistencia -----
  setSidebarWidth = (newWidth: number) => {
    if (typeof newWidth === "number") {
      this.state.sidebar.width = newWidth;
    }
  };

  getSidebarWidth = () => {
    return this.state.sidebar.width;
  };

  toggleSidebar = () => {
    this.state.sidebar.isOpen = !this.state.sidebar.isOpen;
  };

  closeSidebar = () => {
    this.state.sidebar.isOpen = false;
  };

  isSidebarOpen = () => {
    return this.state.sidebar.isOpen;
  };

  // setSidebarWidth = (newWidth: number) => {
  //   if (typeof newWidth === "number") {
  //     localStorage.setItem("sidebarWidth", newWidth.toString());
  //     console.log("saving width", newWidth);
  //   }
  // };

  // getSidebarWidth = () => {
  //   const width = localStorage.getItem("sidebarWidth");
  //   console.log("getting", width);
  //   return width !== null ? Number(width) : null;
  // };

  // ========= Métodos para Property Editor =========

  openPropertyEditor = (
    noteId: string | null = null,
    propertyId: string | null = null,
  ) => {
    this.state.propertyEditor = {
      isOpen: true,
      noteId: noteId,
      propertyId: propertyId,
    };
  };

  closePropertyEditor = () => {
    this.state.propertyEditor = {
      isOpen: false,
      noteId: null,
      propertyId: null,
    };
  };

  isOpenPropertyEditor = (
    noteId: string | null = null,
    propertyId: string | null = null,
  ) => {
    return (
      workspace.state.propertyEditor.isOpen &&
      workspace.state.propertyEditor.noteId === noteId &&
      workspace.state.propertyEditor.propertyId === propertyId
    );
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
}

export const workspace = $state(new WorkspaceController());
