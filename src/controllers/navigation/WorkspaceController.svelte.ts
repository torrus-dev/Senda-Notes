// WorkspaceController.svelte.ts
import type { Tab } from "@projectTypes/ui/uiTypes";
import { startupManager } from "@infrastructure/startup/startupManager.svelte";
import { noteQueryController } from "@controllers/notes/NoteQueryController.svelte";
import { createNoteReference } from "@utils/noteUtils";
import { settingsController } from "@controllers/application/SettingsController.svelte";
import { Note } from "@domain/entities/Note";
import { WorkspaceRepository } from "@infrastructure/repositories/ui/WorkspaceRepository";
import { WorkspaceService } from "@domain/services/WorkspaceService";

class WorkspaceController {
   private workspaceService = new WorkspaceService();
   private settingsApplied = false;

   private get workspaceRepository(): WorkspaceRepository {
      return startupManager.getService("workspaceRepository");
   }

   constructor() {
      $effect.root(() => {
         $effect(() => {
            if (!this.settingsApplied && settingsController.isReady) {
               if (settingsController.get("keepTabs") === false) {
                  this.closeAllTabs();
               }
               this.settingsApplied = true;
            }
         });
      });
   }

   // === Getters delegados ===
   get tabs(): Tab[] {
      return this.workspaceRepository.tabs;
   }

   get activeTabId(): string | undefined {
      return this.workspaceRepository.activeTabId;
   }

   get activeTab(): Tab | undefined {
      return this.workspaceRepository.getActiveTab();
   }

   get activeNoteId(): string | undefined {
      return this.activeTab?.noteReference?.noteId;
   }

   get hasActiveTabs(): boolean {
      return this.tabs.length > 0;
   }

   // === Operaciones principales ===
   openNote(noteId: Note["id"]) {
      const decision = this.workspaceService.determineOpenNoteAction(
         noteId,
         this.tabs,
         this.activeTabId,
      );

      switch (decision.action) {
         case "activate":
            this.activateTab(decision.targetTabId!);
            break;
         case "switch":
            this.switchTabNote(decision.targetNoteId, decision.targetTabId!);
            break;
         case "create":
            this.createTabWithNote(decision.targetNoteId);
            break;
      }
   }

   openNoteInNewTab(noteId: Note["id"]) {
      const existingTab = this.workspaceRepository.getTabByNoteId(noteId);

      if (existingTab) {
         // Si ya está abierta, solo activarla
         this.activateTab(existingTab.id);
      } else {
         // Crear nueva pestaña con la nota
         this.createTabWithNote(noteId);
      }
   }

   createEmptyTab() {
      const newTab: Tab = {
         id: this.workspaceService.generateTabId(),
         noteReference: undefined,
      };
      this.workspaceRepository.addTab(newTab);
      this.workspaceRepository.activeTabId = newTab.id;
   }

   // Metodos de cierre de pestaña

   closeTab(tabId: Tab["id"]) {
      const nextActiveTabId = this.workspaceService.determineNextActiveTab(
         tabId,
         this.tabs,
         this.activeTabId,
      );

      this.workspaceRepository.removeTab(tabId);
      this.workspaceRepository.activeTabId = nextActiveTabId;
   }

   closeAllTabs() {
      this.workspaceRepository.clearTabs();
   }

   closeOtherTabs(tabId: Tab["id"]) {
      const tab = this.workspaceRepository.getTabByTabId(tabId);
      if (tab) {
         this.workspaceRepository.tabs = [tab];
         this.workspaceRepository.activeTabId = tab.id;
      }
   }

   closeLeftTabs(tabId: Tab["id"]) {
      const tabsToClose = this.workspaceService.getTabsToLeft(tabId, this.tabs);

      if (tabsToClose.length === 0) return;

      const tabIdsToClose = tabsToClose.map((tab) => tab.id);

      // Si alguna de las pestañas a cerrar es la activa, cambiar a la pestaña de referencia
      if (tabIdsToClose.includes(this.activeTabId ?? "")) {
         this.workspaceRepository.activeTabId = tabId;
      }

      // Remover todas las pestañas de una vez
      this.workspaceRepository.removeMultipleTabs(tabIdsToClose);
   }

   closeRightTabs(tabId: Tab["id"]) {
      const tabsToClose = this.workspaceService.getTabsToRight(
         tabId,
         this.tabs,
      );

      if (tabsToClose.length === 0) return;

      const tabIdsToClose = tabsToClose.map((tab) => tab.id);

      // Si alguna de las pestañas a cerrar es la activa, cambiar a la pestaña de referencia
      if (tabIdsToClose.includes(this.activeTabId ?? "")) {
         this.workspaceRepository.activeTabId = tabId;
      }

      // Remover todas las pestañas de una vez
      this.workspaceRepository.removeMultipleTabs(tabIdsToClose);
   }

   moveTab(fromIndex: number, toIndex: number) {
      if (
         !this.workspaceService.isValidTabMove(
            fromIndex,
            toIndex,
            this.tabs.length,
         )
      ) {
         return;
      }
      this.workspaceRepository.moveTab(fromIndex, toIndex);
   }

   // === Navegación ===
   nextTab() {
      const currentIndex = this.findTabIndex(this.activeTabId);
      if (currentIndex === -1) return;

      const nextIndex = this.workspaceService.getNextTabIndex(
         currentIndex,
         this.tabs.length,
      );
      this.activateTab(this.tabs[nextIndex].id);
   }

   previousTab() {
      const currentIndex = this.findTabIndex(this.activeTabId);
      if (currentIndex === -1) return;

      const prevIndex = this.workspaceService.getPreviousTabIndex(
         currentIndex,
         this.tabs.length,
      );
      this.activateTab(this.tabs[prevIndex].id);
   }

   clearActiveTabNote() {
      if (!this.activeTabId) return;
      this.workspaceRepository.updateTabNote(this.activeTabId, undefined);
   }

   // === Métodos auxiliares privados ===
   activateTab(tabId: Tab["id"]) {
      if (this.workspaceRepository.getTabByTabId(tabId)) {
         this.workspaceRepository.activeTabId = tabId;
      }
   }

   private switchTabNote(noteId: Note["id"], tabId: Tab["id"]) {
      const note = noteQueryController.getNoteById(noteId);
      if (!note) return;

      const newReference = createNoteReference(note);
      this.workspaceRepository.updateTabNote(tabId, newReference);
   }

   private createTabWithNote(noteId: Note["id"]) {
      const note = noteQueryController.getNoteById(noteId);
      if (!note) return;

      const newTab: Tab = {
         id: this.workspaceService.generateTabId(),
         noteReference: createNoteReference(note),
      };

      this.workspaceRepository.addTab(newTab);
      this.workspaceRepository.activeTabId = newTab.id;
   }

   private findTabIndex(tabId?: string): number {
      if (!tabId) return -1;
      return this.tabs.findIndex((tab) => tab.id === tabId);
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
