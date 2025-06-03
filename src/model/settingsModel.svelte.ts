import { Settings } from "@projectTypes/settingsTypes";
import { loadSettingsState, saveSettingsState } from "@utils/storage";

class SettingsModel {
   private data: Settings = $state({
      theme: "light",
      showEditorToolbar: true,
      sidebarIsLocked: false,
      showMetadata: false,
      debugLevel: 0,
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

   // theme
   get theme() {
      return this.data.theme;
   }
   set theme(value: "light" | "dark") {
      this.data.theme = value;
   }

   // showEditorToolbar
   get showEditorToolbar() {
      return this.data.showEditorToolbar;
   }
   set showEditorToolbar(value: boolean) {
      this.data.showEditorToolbar = value;
   }

   // sidebarIsLocked
   get sidebarIsLocked() {
      return this.data.sidebarIsLocked;
   }
   set sidebarIsLocked(value: boolean) {
      this.data.sidebarIsLocked = value;
   }

   // show metadata
   get showMetadata() {
      return this.data.showMetadata;
   }
   set showMetadata(value: boolean) {
      this.data.showMetadata = value;
   }

   // debugLevel
   get debugLevel(): Settings["debugLevel"] {
      return this.data.debugLevel;
   }
   set debugLevel(value: Settings["debugLevel"]) {
      this.data.debugLevel = value;
   }
}
export let settingsModel = $state(new SettingsModel());
