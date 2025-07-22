import type { Tab } from "@projectTypes/ui/uiTypes";

import { startupManager } from "@infrastructure/startup/startupManager.svelte";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";
import { createNoteReference } from "@utils/noteUtils";
import { settingsController } from "@controllers/application/settingsController.svelte";
import { Note } from "@domain/entities/Note";
import { WorkspaceRepository } from "@infrastructure/repositories/ui/WorkspaceRepository";

class WorkspaceController {
   private get workspaceRepository(): WorkspaceRepository {
      return startupManager.getService("workspaceRepository");
   }

   private settingsAplied = false;
   constructor() {
      $effect.root(() => {
         $effect(() => {
            if (!this.settingsAplied && settingsController.isReady) {
               if (settingsController.get("keepTabs") === false) {
                  this.closeAllTabs();
               }
               this.settingsAplied = true;
            }
         });
      });
   }

   getTabByTabId(tabId: Tab["id"]): Tab | undefined {
      return this.workspaceRepository.getTabByTabId(tabId);
   }
   getTabByNoteId(noteId: Note["id"]): Tab | undefined {
      return this.workspaceRepository.getTabByNoteId(noteId);
   }
   getActiveTab() {
      return this.workspaceRepository.getActiveTab();
   }

   isNoteOpenInTab(noteId: Note["id"]): boolean {
      return this.findTabIndexByNoteId(noteId) !== -1;
   }

   findTabIndexByTabId(tabId: string): number {
      return this.workspaceRepository.tabs.findIndex(
         (tab: Tab) => tab.id === tabId,
      );
   }
   findTabIndexByNoteId(noteId: Note["id"]): number {
      return this.workspaceRepository.tabs.findIndex(
         (tab: Tab) => tab.noteReference?.noteId === noteId,
      );
   }

   // metodo para cuando hacemos click normal sobre una nota para abrirla, el lo gestiona todo.
   openNote(noteId: Note["id"]) {
      const activeTabId = this.workspaceRepository.activeTabId;
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
      this.workspaceRepository.activeTabId = tab.id;
   }
   activateTabByTabId(tabId: Tab["id"]) {
      const tab = this.getTabByTabId(tabId);
      if (!tab) return;
      this.workspaceRepository.activeTabId = tab.id;
   }

   // cambiar la nota de la tab activa
   switchActiveTabNote(noteId: Note["id"]) {
      if (!this.workspaceRepository.activeTabId) return;
      this.switchTabNote(noteId, this.workspaceRepository.activeTabId);
   }

   unsetActiveTabNoteReference() {
      const { activeTabId } = this.workspaceRepository;
      if (!activeTabId) return;
      const tabIndex = this.findTabIndexByTabId(activeTabId);
      if (tabIndex === -1) return;

      this.workspaceRepository.tabs[tabIndex].noteReference = undefined;
   }
   private switchTabNote(noteId: Note["id"], tabId: string) {
      const note = noteQueryController.getNoteById(noteId);
      const tabIndex = this.findTabIndexByTabId(tabId);
      if (!note || tabIndex === -1) return;
      const newReference = createNoteReference(note);
      this.workspaceRepository.tabs[tabIndex].noteReference = newReference;
   }

   addTabAndSetActive(newTab: Tab) {
      this.workspaceRepository.tabs.push(newTab);
      this.workspaceRepository.activeTabId = newTab.id;
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

      this.workspaceRepository.tabs.splice(tabIndex, 1);

      if (this.workspaceRepository.activeTabId === tabId) {
         if (this.workspaceRepository.tabs.length === 0) {
            // No quedan pestañas
            this.workspaceRepository.activeTabId = undefined;
         } else {
            // Activar la pestaña anterior o la primera disponible
            const newActiveTabIndex = Math.max(0, tabIndex - 1);
            this.workspaceRepository.activeTabId =
               this.workspaceRepository.tabs[newActiveTabIndex].id;
         }
      }
   }
   closeTabByNoteId(noteId: Note["id"]) {
      const tabIndex = this.findTabIndexByNoteId(noteId);
      if (tabIndex === -1) return;

      const tabId = this.workspaceRepository.tabs[tabIndex].id;
      this.closeTabByTabId(tabId);
   }

   // Cerrar todas las pestañas
   closeAllTabs() {
      this.workspaceRepository.tabs = [];
      this.workspaceRepository.activeTabId = undefined;
   }

   // Cerrar todas las pestañas excepto la activa
   closeOtherTabs(tabId: Tab["id"]) {
      const tab = this.getTabByTabId(tabId);
      if (tab) {
         this.workspaceRepository.tabs = [tab];
      }
   }

   // Mover una pestaña a una nueva posición
   moveTab(fromIndex: number, toIndex: number) {
      const tabs = this.workspaceRepository.tabs;
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
      return this.workspaceRepository.tabs;
   }

   get hasActiveTabs(): boolean {
      return this.workspaceRepository.tabs.length > 0;
   }

   get activeTabIndex(): number | undefined {
      const activeTabId = this.workspaceRepository.activeTabId;
      if (activeTabId) {
         return this.findTabIndexByTabId(activeTabId);
      }
      return undefined;
   }

   // Navegación entre pestañas
   nextTab() {
      const tabs = this.workspaceRepository.tabs;
      if (tabs.length <= 1) return;

      const currentIndex = this.activeTabIndex;
      if (currentIndex) {
         const nextIndex = (currentIndex + 1) % tabs.length;
         this.activateTabByNoteId(tabs[nextIndex].id);
      }
   }

   previousTab() {
      const tabs = this.workspaceRepository.tabs;
      if (tabs.length <= 1) return;

      const currentIndex = this.activeTabIndex;
      if (currentIndex) {
         const prevIndex =
            currentIndex <= 0 ? tabs.length - 1 : currentIndex - 1;
         this.activateTabByNoteId(tabs[prevIndex].id);
      }
   }
}

let instance: WorkspaceController | null = null;

export const workspaceController = new Proxy(
   {},
   {
      get(_, prop) {
         if (!instance) instance = new WorkspaceController();
         const value = instance[prop as keyof WorkspaceController];
         return typeof value === "function" ? value.bind(instance) : value;
      },
   },
) as WorkspaceController;
