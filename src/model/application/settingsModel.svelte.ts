import { Settings } from "@projectTypes/settingsTypes";

const SETTINGS_STORAGE_KEY = "settings"; // Ajusta esta clave según tu aplicación

class SettingsModel {
   private data: Settings = $state(this.getDefaultSettings());

   constructor() {
      this.loadSettings();
      $effect.root(() => {
         $effect(() => {
            this.saveSettings();
         });
      });
   }

   // Funciones auxiliares integradas
   private saveSettings() {
      try {
         localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.data));
      } catch (error) {
         console.error("Error al guardar el estado de configuración:", error);
      }
   }

   private loadSavedSettings(): Settings | null {
      try {
         const storedState = localStorage.getItem(SETTINGS_STORAGE_KEY);
         return storedState ? JSON.parse(storedState) : null;
      } catch (error) {
         console.error("Error al cargar el estado de configuración:", error);
         return null;
      }
   }

   private getDefaultSettings(): Settings {
      return {
         showEditorToolbar: false,
         theme: "dark",
         sidebarIsLocked: false,
         showMetadata: false,
         debugLevel: 0,
      };
   }

   loadSettings() {
      const loadedState = this.loadSavedSettings();
      if (loadedState) {
         this.data = loadedState;
      } else {
         // Si no hay datos guardados, usar los valores por defecto
         const defaultState = this.getDefaultSettings();
         this.data = { ...this.data, ...defaultState };
      }
   }

   // theme
   get theme() {
      return this.data.theme;
   }
   set theme(value: "light" | "dark") {
      this.data.theme = value;
   }

   // showEditorToolbar
   get showEditorToolbar() {
      return this.data.showEditorToolbar;
   }
   set showEditorToolbar(value: boolean) {
      this.data.showEditorToolbar = value;
   }

   // sidebarIsLocked
   get sidebarIsLocked() {
      return this.data.sidebarIsLocked;
   }
   set sidebarIsLocked(value: boolean) {
      this.data.sidebarIsLocked = value;
   }

   // show metadata
   get showMetadata() {
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
}

export let settingsModel = $state(new SettingsModel());
