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
      this.save();
   }

   get activeTabId() {
      return this.data.activeTabId;
   }

   set activeTabId(newValue: string | undefined) {
      this.data.activeTabId = newValue;
      this.save();
   }

   // === Operaciones CRUD ===
   addTab(tab: Tab) {
      this.data.tabs.push(tab);
      this.save();
   }

   removeTab(tabId: string) {
      this.data.tabs = this.data.tabs.filter((tab) => tab.id !== tabId);
      this.save();
   }

   removeMultipleTabs(tabIds: string[]) {
      this.data.tabs = this.data.tabs.filter((tab) => !tabIds.includes(tab.id));
      this.save();
   }

   clearTabs() {
      this.data.tabs = [];
      this.data.activeTabId = undefined;
      this.save();
   }

   updateTabNote(tabId: string, noteReference?: NoteReference) {
      const tab = this.getTabByTabId(tabId);
      if (tab) {
         tab.noteReference = noteReference;
         this.save();
      }
   }

   moveTab(fromIndex: number, toIndex: number) {
      const [movedTab] = this.data.tabs.splice(fromIndex, 1);
      this.data.tabs.splice(toIndex, 0, movedTab);
      this.save();
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
