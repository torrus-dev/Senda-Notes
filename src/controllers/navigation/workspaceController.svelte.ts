import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";
import {
   type Tab,
   workspaceModel,
} from "@model/navigation/workspaceModel.svelte";
import type { Note, NoteReference } from "@projectTypes/core/noteTypes";
import { createNoteReference } from "@utils/noteUtils";

class WorkspaceController {
   getTabByTabId(tabId: Tab["id"]): Tab | undefined {
      return workspaceModel.data.tabs.find((tab: Tab) => tab.id === tabId);
   }
   getTabByNoteId(noteId: Note["id"]): Tab | undefined {
      return workspaceModel.data.tabs.find(
         (tab: Tab) => tab.noteReference?.noteId === noteId,
      );
   }
   getActiveTab() {
      const activeId = workspaceModel.data.activeTabId;
      if (activeId) {
         return this.getTabByTabId(activeId);
      }
      return undefined;
   }

   findTabIndexByTabId(tabId: string): number {
      return workspaceModel.data.tabs.findIndex((tab: Tab) => tab.id === tabId);
   }
   findTabIndexByNoteId(noteId: Note["id"]): number {
      return workspaceModel.data.tabs.findIndex(
         (tab: Tab) => tab.noteReference?.noteId === noteId,
      );
   }

   // metodo para cuando hacemos click normal sobre una nota para abrirla, el lo gestiona todo.
   openNote(noteId: Note["id"]) {
      const activeTabId = workspaceModel.data.activeTabId;
      if (activeTabId) {
         if (this.isNoteOpenInTab(noteId)) {
            this.activateTabByNoteId(noteId);
         } else {
            this.switchActiveTabNote(noteId);
         }
      } else {
         this.openNoteInNewTab(noteId);
      }
   }
   // poner tab que contiene la nota como principal
   activateTabByNoteId(noteId: Note["id"]) {
      const tab = this.getTabByNoteId(noteId);
      if (!tab) return;
      workspaceModel.data.activeTabId = tab.id;
   }
   activateTabByTabId(tabId: Tab["id"]) {
      const tab = this.getTabByTabId(tabId);
      if (!tab) return;
      workspaceModel.data.activeTabId = tab.id;
   }

   // cambiar la nota de la tab activa
   switchActiveTabNote(noteId: Note["id"]) {
      if (!workspaceModel.data.activeTabId) return;
      this.switchTabNote(noteId, workspaceModel.data.activeTabId);
   }

   unsetActiveTabNoteReference() {
      const { activeTabId } = workspaceModel.data;
      if (!activeTabId) return;
      const tabIndex = this.findTabIndexByTabId(activeTabId);
      if (tabIndex === -1) return;

      workspaceModel.data.tabs[tabIndex].noteReference = undefined;
   }
   private switchTabNote(noteId: Note["id"], tabId: string) {
      const note = noteQueryController.getNoteById(noteId);
      const tabIndex = this.findTabIndexByTabId(tabId);
      if (!note || tabIndex === -1) return;
      const newReference = createNoteReference(note);
      workspaceModel.data.tabs[tabIndex].noteReference = newReference;
   }

   addTabAndSetActive(newTab: Tab) {
      workspaceModel.data.tabs.push(newTab);
      workspaceModel.data.activeTabId = newTab.id;
   }

   newEmptyTab() {
      const newTab = {
         id: crypto.randomUUID(),
         noteReference: undefined,
      };
      this.addTabAndSetActive(newTab);
   }

   // crear una nueva tab con una referencia
   openNoteInNewTab(noteId: Note["id"]) {
      const note = noteQueryController.getNoteById(noteId);
      if (!note) return;
      if (!this.isNoteOpenInTab(noteId)) {
         const newTab = {
            id: crypto.randomUUID(),
            noteReference: createNoteReference(note),
         };
         this.addTabAndSetActive(newTab);
      } else {
         this.activateTabByNoteId(noteId);
      }
   }

   closeTabByTabId(tabId: Tab["id"]) {
      const tabIndex = this.findTabIndexByTabId(tabId);
      if (tabIndex === -1) return;

      workspaceModel.data.tabs.splice(tabIndex, 1);

      if (workspaceModel.data.activeTabId === tabId) {
         if (workspaceModel.data.tabs.length === 0) {
            // No quedan pestañas
            workspaceModel.data.activeTabId = undefined;
         } else {
            // Activar la pestaña anterior o la primera disponible
            const newActiveTabIndex = Math.max(0, tabIndex - 1);
            workspaceModel.data.activeTabId =
               workspaceModel.data.tabs[newActiveTabIndex].id;
         }
      }
   }
   closeTabByNoteId(noteId: Note["id"]) {
      const tabIndex = this.findTabIndexByNoteId(noteId);
      if (tabIndex === -1) return;

      const tabId = workspaceModel.data.tabs[tabIndex].id;
      this.closeTabByTabId(tabId);
   }

   isNoteOpenInTab(noteId: Note["id"]): boolean {
      return this.findTabIndexByNoteId(noteId) !== -1;
   }

   // Cerrar todas las pestañas
   closeAllTabs() {
      workspaceModel.data.tabs = [];
      workspaceModel.data.activeTabId = undefined;
   }

   // Cerrar todas las pestañas excepto la activa
   closeOtherTabs(tabId: Tab["id"]) {
      const tab = this.getTabByTabId(tabId);
      if (tab) {
         workspaceModel.data.tabs = [tab];
      }
   }

   // Mover una pestaña a una nueva posición
   moveTab(fromIndex: number, toIndex: number) {
      const tabs = workspaceModel.data.tabs;
      if (
         fromIndex < 0 ||
         fromIndex >= tabs.length ||
         toIndex < 0 ||
         toIndex >= tabs.length
      ) {
         return;
      }

      const [movedTab] = tabs.splice(fromIndex, 1);
      tabs.splice(toIndex, 0, movedTab);
   }

   // Getters útiles para el sistema de pestañas
   get activeNoteId(): Note["id"] | undefined {
      return this.getActiveTab()?.noteReference?.noteId;
   }

   get tabs(): Tab[] {
      return workspaceModel.data.tabs;
   }

   get hasActiveTabs(): boolean {
      return workspaceModel.data.tabs.length > 0;
   }

   get activeTabIndex(): number | undefined {
      const activeTabId = workspaceModel.data.activeTabId;
      if (activeTabId) {
         return this.findTabIndexByTabId(activeTabId);
      }
      return undefined;
   }

   // Navegación entre pestañas
   nextTab() {
      const tabs = workspaceModel.data.tabs;
      if (tabs.length <= 1) return;

      const currentIndex = this.activeTabIndex;
      if (currentIndex) {
         const nextIndex = (currentIndex + 1) % tabs.length;
         this.activateTabByNoteId(tabs[nextIndex].id);
      }
   }

   previousTab() {
      const tabs = workspaceModel.data.tabs;
      if (tabs.length <= 1) return;

      const currentIndex = this.activeTabIndex;
      if (currentIndex) {
         const prevIndex =
            currentIndex <= 0 ? tabs.length - 1 : currentIndex - 1;
         this.activateTabByNoteId(tabs[prevIndex].id);
      }
   }
}

export const workspaceController = $state(new WorkspaceController());
