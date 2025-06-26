import { Settings } from "@projectTypes/core/settingsTypes";
import { PersistentModel } from "@model/persistentModel.svelte";

class SettingsModel extends PersistentModel<Settings> {
   constructor() {
      super("settings"); // nombre del archivo JSON
   }

   protected getDefaultData(): Settings {
      return {
         showEditorToolbar: false,
         sidebarIsLocked: false,
         showMetadata: false,
         debugLevel: 0,
      };
   }

   // Getters y setters para cada propiedad

   // showEditorToolbar
   get showEditorToolbar(): boolean {
      return this.data.showEditorToolbar;
   }
   set showEditorToolbar(value: boolean) {
      this.data.showEditorToolbar = value;
   }

   // sidebarIsLocked
   get sidebarIsLocked(): boolean {
      return this.data.sidebarIsLocked;
   }
   set sidebarIsLocked(value: boolean) {
      this.data.sidebarIsLocked = value;
   }

   // showMetadata
   get showMetadata(): boolean {
      return this.data.showMetadata;
   }
   set showMetadata(value: boolean) {
      this.data.showMetadata = value;
   }

   // debugLevel
   get debugLevel(): Settings["debugLevel"] {
      return this.data.debugLevel;
   }
   set debugLevel(value: Settings["debugLevel"]) {
      this.data.debugLevel = value;
   }

   // Métodos adicionales específicos para settings
   public toggleEditorToolbar(): void {
      this.showEditorToolbar = !this.showEditorToolbar;
   }

   public toggleSidebarLock(): void {
      this.sidebarIsLocked = !this.sidebarIsLocked;
   }

   public toggleMetadata(): void {
      this.showMetadata = !this.showMetadata;
   }

   public setDebugLevel(level: number): void {
      this.debugLevel = Math.max(0, Math.min(level, 3)); // Limitar entre 0 y 3
   }
}

export const settingsModel = $state(new SettingsModel());
