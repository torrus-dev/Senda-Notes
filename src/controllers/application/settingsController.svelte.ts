import { settingsModel } from "@model/application/settingsModel.svelte";

class SettingsController {
   // lock sidebar
   toggleLockSidebar = () => {
      settingsModel.data.sidebarIsLocked = !settingsModel.data.sidebarIsLocked;
   };
   get lockSidebar() {
      return settingsModel.data.sidebarIsLocked;
   }

   // show metadata
   toggleShowMetadata = (): void => {
      settingsModel.data.showMetadata = !settingsModel.data.showMetadata;
   };
   get showMetadata() {
      return settingsModel.data.showMetadata;
   }

   // show editor toolbar
   toogleShowEditorToolbar(): void {
      settingsModel.data.showEditorToolbar =
         !settingsModel.data.showEditorToolbar;
   }
   get showEditorToolbar() {
      return settingsModel.data.showEditorToolbar;
   }

   // debug level
   set debugLevel(value: number) {
      settingsModel.data.debugLevel = value;
   }
   get debugLevel() {
      return settingsModel.data.debugLevel;
   }
}

export const settingsController = $state(new SettingsController());
