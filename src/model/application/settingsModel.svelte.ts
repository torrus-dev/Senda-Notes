import { AppSettings } from "@projectTypes/core/settingsTypes";
import { PersistentModel } from "@model/persistentModel.svelte";

class SettingsModel extends PersistentModel<AppSettings> {
   constructor() {
      // nombre del archivo JSON
      super("app-settings");
   }

   protected getDefaultData(): AppSettings {
      return {
         uiMode: "system",
         showEditorToolbar: false,
         sidebarIsLocked: false,
         showMetadata: false,
         debugLevel: 0,
      };
   }
}

export const settingsModel = $state(new SettingsModel());
