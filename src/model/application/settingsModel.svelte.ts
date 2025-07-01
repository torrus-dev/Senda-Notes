import { PersistentJsonFileModel } from "@model/persistentJsonFileModel.svelte";
import type { UiModeType } from "@projectTypes/ui/uiTypes";

type AppSettings = {
   uiMode: UiModeType;
   showEditorToolbar: boolean;
   sidebarIsLocked: boolean;
   showMetadata: boolean;
   debugLevel: number;
   permanentTabBar: boolean;
};

class SettingsModel extends PersistentJsonFileModel<AppSettings> {
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
         permanentTabBar: true,
      };
   }
}

export const settingsModel = $state(new SettingsModel());
