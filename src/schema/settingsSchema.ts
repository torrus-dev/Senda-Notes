import type { UiModeType } from "@projectTypes/ui/uiTypes";

// Tipos para el schema
export type SettingType = "boolean" | "number" | "string" | "select";

export interface SettingDefinition {
   type: SettingType;
   defaultValue: any;
   options?: any[]; // Para tipo 'select'
   min?: number; // Para tipo 'number'
   max?: number; // Para tipo 'number'
   i18nKey?: string; // Para futura internacionalización
}

export interface SettingsSchema {
   [key: string]: SettingDefinition;
}

// Schema de configuración - aquí defines todo una sola vez
export const settingsSchema: SettingsSchema = {
   uiMode: {
      type: "select",
      defaultValue: "system" as UiModeType,
      options: ["system", "light", "dark"] as UiModeType[],
      i18nKey: "settings.uiMode",
   },
   showEditorToolbar: {
      type: "boolean",
      defaultValue: false,
      i18nKey: "settings.showEditorToolbar",
   },
   sidebarIsLocked: {
      type: "boolean",
      defaultValue: false,
      i18nKey: "settings.sidebarIsLocked",
   },
   showMetadata: {
      type: "boolean",
      defaultValue: false,
      i18nKey: "settings.showMetadata",
   },
   debugLevel: {
      type: "number",
      defaultValue: 0,
      min: 0,
      max: 5,
      i18nKey: "settings.debugLevel",
   },
   permanentTabBar: {
      type: "boolean",
      defaultValue: true,
      i18nKey: "settings.permanentTabBar",
   },
};

// Tipos derivados automáticamente del schema
export type AppSettings = {
   [K in keyof typeof settingsSchema]: (typeof settingsSchema)[K]["defaultValue"];
};

// Función helper para obtener valores por defecto
export function getDefaultSettings(): AppSettings {
   const defaults = {} as AppSettings;

   for (const [key, definition] of Object.entries(settingsSchema)) {
      (defaults as any)[key] = definition.defaultValue;
   }

   return defaults;
}
