import { PersistentJsonFileModel } from "@model/persistentJsonFileModel.svelte";
import { getDefaultSettings, type AppSettings } from "@schema/settingsSchema";

export class SettingsModel extends PersistentJsonFileModel<AppSettings> {
   constructor() {
      super("app-settings");
   }

   protected getDefaultData(): AppSettings {
      return getDefaultSettings();
   }
}
