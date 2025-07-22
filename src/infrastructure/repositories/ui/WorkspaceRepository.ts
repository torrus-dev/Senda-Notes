// WorkspaceRepository.ts
import type { Tab } from "@projectTypes/ui/uiTypes";
import { LocalStorageAdapter } from "@infrastructure/persistence/LocalStorageAdapter.svelte";
import { NoteReference } from "@projectTypes/core/noteTypes";

interface WorkspaceData {
   tabs: Tab[];
   activeTabId: string | undefined;
}

export class WorkspaceRepository extends LocalStorageAdapter<WorkspaceData> {
   constructor() {
      super("NoteNavigation");
   }

   protected getDefaultData(): WorkspaceData {
      return {
         tabs: [],
         activeTabId: undefined,
      };
   }

   // === Getters básicos ===
   get tabs() {
      return this.data.tabs;
   }

   set tabs(newValue: Tab[]) {
      this.data.tabs = newValue;
   }

   get activeTabId() {
      return this.data.activeTabId;
   }

   set activeTabId(newValue: string | undefined) {
      this.data.activeTabId = newValue;
   }

   // === Operaciones CRUD ===
   addTab(tab: Tab) {
      this.data.tabs.push(tab);
   }

   removeTab(tabId: string) {
      this.data.tabs = this.data.tabs.filter((tab) => tab.id !== tabId);
   }

   clearTabs() {
      this.data.tabs = [];
      this.data.activeTabId = undefined;
   }

   updateTabNote(tabId: string, noteReference?: NoteReference) {
      const tab = this.getTabByTabId(tabId);
      if (tab) {
         tab.noteReference = noteReference;
      }
   }

   moveTab(fromIndex: number, toIndex: number) {
      const [movedTab] = this.data.tabs.splice(fromIndex, 1);
      this.data.tabs.splice(toIndex, 0, movedTab);
   }

   // === Queries ===
   getTabByTabId(tabId: string): Tab | undefined {
      return this.data.tabs.find((tab) => tab.id === tabId);
   }

   getTabByNoteId(noteId: string): Tab | undefined {
      return this.data.tabs.find((tab) => tab.noteReference?.noteId === noteId);
   }

   getActiveTab(): Tab | undefined {
      return this.activeTabId
         ? this.getTabByTabId(this.activeTabId)
         : undefined;
   }
}
