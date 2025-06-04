import { settingsModel } from "@model/application/settingsModel.svelte";

class SettingsController {
   // theme
   toggleThemeMode = () => {
      settingsModel.theme = settingsModel.theme === "light" ? "dark" : "light";
   };
   getTheme = (): "light" | "dark" => settingsModel.theme;

   // lock sidebar
   toggleLockSidebar = () => {
      settingsModel.sidebarIsLocked = !settingsModel.sidebarIsLocked;
   };
   getLockSidebar = () => settingsModel.sidebarIsLocked;

   // show metadata
   toggleShowMetadata = (): void => {
      settingsModel.showMetadata = !settingsModel.showMetadata;
   };
   getShowMetadata = () => settingsModel.showMetadata;

   // show editor toolbar
   toogleShowEditorToolbar = (): void => {
      settingsModel.showEditorToolbar = !settingsModel.showEditorToolbar;
   };
   getShowEditorToolbar = () => settingsModel.showEditorToolbar;

   // debug level
   setDebugLevel = (value: number) => {
      settingsModel.debugLevel = value;
   };
   getDebugLevel = () => settingsModel.debugLevel;
}

export const settingsController = $state(new SettingsController());
