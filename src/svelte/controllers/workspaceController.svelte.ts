import type { WorkspaceState } from "../types/types";
import type { Dimensions } from "../types/contextMenu";

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
  // Estado de la ventana
  windowSize = $state<Dimensions>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("resize", () => {
        this.windowSize = {
          width: window.innerWidth,
          height: window.innerHeight,
        };
      });
    }
  }

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
}

export const workspace = $state(new WorkspaceController());
