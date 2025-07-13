import { PersistentJsonFileModel } from "@model/persistentJsonFileModel.svelte";
import { getDefaultSettings, type AppSettings } from "@schema/settingsSchema";

class SettingsModel extends PersistentJsonFileModel<AppSettings> {
   constructor() {
      super("app-settings");
   }

   protected getDefaultData(): AppSettings {
      return getDefaultSettings();
   }
}

export const settingsModel = $state(new SettingsModel());
