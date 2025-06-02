import { settingsStore } from "@modal/settingsStore.svelte";

class SettingsController {
   // theme
   toggleThemeMode = () => {
      settingsStore.theme = settingsStore.theme === "light" ? "dark" : "light";
   };
   getTheme = (): "light" | "dark" => settingsStore.theme;

   // lock sidebar
   toggleLockSidebar = () => {
      settingsStore.sidebarIsLocked = !settingsStore.sidebarIsLocked;
   };
   getLockSidebar = () => settingsStore.sidebarIsLocked;

   // show metadata
   toggleShowMetadata = (): void => {
      settingsStore.showMetadata = !settingsStore.showMetadata;
   };
   getShowMetadata = () => settingsStore.showMetadata;

   // show editor toolbar
   toogleShowEditorToolbar = (): void => {
      settingsStore.showEditorToolbar = !settingsStore.showEditorToolbar;
   };
   getShowEditorToolbar = () => settingsStore.showEditorToolbar;

   // debug level
   setDebugLevel = (value: number) => {
      settingsStore.debugLevel = value;
   };
   getDebugLevel = () => settingsStore.debugLevel;
}

export const settingsController = $state(new SettingsController());
