import { JsonFileAdapter } from "@infrastructure/persistence/JsonFileAdapter.svelte";
import { getDefaultSettings, type AppSettings } from "@schema/settingsSchema";

export class SettingsModel extends JsonFileAdapter<AppSettings> {
   constructor() {
      super("app-settings");
   }

   protected getDefaultData(): AppSettings {
      return getDefaultSettings();
   }
}
