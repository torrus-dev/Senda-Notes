import { PersistentJsonFileModel } from "@model/persistentJsonFileModel.svelte";

interface AppSettings {
   uiMode: "dark" | "light" | "system";
   showEditorToolbar: boolean;
   showMetadata: boolean;
   keepTabs: boolean;
}

class SettingsModel extends PersistentJsonFileModel<AppSettings> {
   constructor() {
      super("app-settings");
   }

   protected getDefaultData(): AppSettings {
      return {
         uiMode: "dark",
         showEditorToolbar: false,
         showMetadata: false,
         keepTabs: true,
      };
   }
}

export const settingsModel = $state(new SettingsModel());
