import { Settings } from "@projectTypes/settingsTypes";
import { loadSettingsState, saveSettingsState } from "@utils/storage";

class SettingsStore {
   private data: Settings = $state({
      theme: "light",
      showEditorToolbar: true,
      sidebarIsLocked: false,
      showMetadata: false,
   });

   constructor() {
      this.loadSettings();
      $effect.root(() => {
         $effect(() => {
            saveSettingsState(this.data);
         });
      });
   }

   loadSettings() {
      const loadedState = loadSettingsState();
      if (loadedState) {
         this.data = loadedState;
      }
   }

   get theme() {
      return this.data.theme;
   }

   set theme(value: "light" | "dark") {
      this.data.theme = value;
   }

   get showEditorToolbar() {
      return this.data.showEditorToolbar;
   }

   set showEditorToolbar(value: boolean) {
      this.data.showEditorToolbar = value;
   }

   get sidebarIsLocked() {
      return this.data.sidebarIsLocked;
   }

   set sidebarIsLocked(value: boolean) {
      this.data.sidebarIsLocked = value;
   }

   get showMetadata() {
      return this.data.showMetadata;
   }

   set showMetadata(value: boolean) {
      this.data.showMetadata = value;
   }
}
export let settingsStore = $state(new SettingsStore());
