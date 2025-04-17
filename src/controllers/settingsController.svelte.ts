import { settingsStore } from "@stores/settingsStore.svelte";

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
   getShowEditorToolbar = () => settingsStore.showEditorToolbar
}

export const settingsController = $state(new SettingsController());
