import type { Tab } from "@projectTypes/ui/uiTypes";
import { LocalStorageAdapter } from "@infrastructure/persistence/LocalStorageAdapter.svelte";
import { Note } from "@domain/entities/Note";

interface WorkspaceData {
   tabs: Tab[];
   activeTabId: string | undefined;
}

export class WorkspaceRepository extends LocalStorageAdapter<WorkspaceData> {
   settingsAplied = false;
   constructor() {
      super("NoteNavigation");
   }

   protected getDefaultData(): WorkspaceData {
      return {
         tabs: [],
         activeTabId: undefined,
      };
   }

   get tabs() {
      return this.data.tabs;
   }
   set tabs(newValue: Tab[]) {
      this.data.tabs = newValue;
   }
   get activeNoteId(): Note["id"] | undefined {
      return this.getActiveTab()?.noteReference?.noteId;
   }
   get activeTabId(): Tab["id"] | undefined {
      return this.data.activeTabId;
   }
   set activeTabId(newValue: Tab["id"] | undefined) {
      this.data.activeTabId = newValue;
   }

   get hasActiveTabs(): boolean {
      return this.data.tabs.length > 0;
   }

   get activeTabIndex(): number | undefined {
      const activeTabId = this.data.activeTabId;
      if (activeTabId) {
         return this.findTabIndexByTabId(activeTabId);
      }
      return undefined;
   }

   getTabByTabId(tabId: Tab["id"]): Tab | undefined {
      return this.data.tabs.find((tab: Tab) => tab.id === tabId);
   }
   getTabByNoteId(noteId: Note["id"]): Tab | undefined {
      return this.data.tabs.find(
         (tab: Tab) => tab.noteReference?.noteId === noteId,
      );
   }
   getActiveTab(): Tab | undefined {
      const activeId = this.data.activeTabId;
      if (activeId) {
         return this.getTabByTabId(activeId);
      }
      return undefined;
   }

   isNoteOpenInTab(noteId: Note["id"]): boolean {
      return this.findTabIndexByNoteId(noteId) !== -1;
   }

   findTabIndexByTabId(tabId: string): number {
      return this.data.tabs.findIndex((tab: Tab) => tab.id === tabId);
   }
   findTabIndexByNoteId(noteId: Note["id"]): number {
      return this.data.tabs.findIndex(
         (tab: Tab) => tab.noteReference?.noteId === noteId,
      );
   }
}
