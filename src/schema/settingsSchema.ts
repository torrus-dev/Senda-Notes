import type { UiModeType } from "@projectTypes/ui/uiTypes";

// Tipos para el schema
export type SettingType = "boolean" | "number" | "string" | "select";

export interface SettingDefinition<T = any> {
   type: SettingType;
   defaultValue: T;
   options?: string[]; // Para tipo 'select'
   min?: number; // Para tipo 'number'
   max?: number; // Para tipo 'number'
   i18nKey?: string; // Para futura internacionalización
}

export interface SettingsSchema {
   [key: string]: SettingDefinition;
}

// Schema de configuración - aquí defines todo una sola vez
export const settingsSchema = {
   uiMode: {
      type: "select",
      defaultValue: "system" as UiModeType,
      options: ["system", "light", "dark"] as UiModeType[],
      i18nKey: "settings.uiMode",
   } as SettingDefinition<UiModeType>,
   showEditorToolbar: {
      type: "boolean",
      defaultValue: false,
      i18nKey: "settings.showEditorToolbar",
   } as SettingDefinition<boolean>,
   sidebarIsLocked: {
      type: "boolean",
      defaultValue: false,
      i18nKey: "settings.sidebarIsLocked",
   } as SettingDefinition<boolean>,
   showMetadata: {
      type: "boolean",
      defaultValue: false,
      i18nKey: "settings.showMetadata",
   } as SettingDefinition<boolean>,
   debugLevel: {
      type: "number",
      defaultValue: 0,
      min: 0,
      max: 5,
      i18nKey: "settings.debugLevel",
   } as SettingDefinition<number>,
   permanentTabBar: {
      type: "boolean",
      defaultValue: true,
      i18nKey: "settings.permanentTabBar",
   } as SettingDefinition<boolean>,
} as const;

// Tipos derivados automáticamente del schema
export type AppSettings = {
   [K in keyof typeof settingsSchema]: (typeof settingsSchema)[K]["defaultValue"];
};

// Tipo para las keys disponibles - esto mejora el autocompletado
export type SettingsKey = keyof typeof settingsSchema;

// Función helper para obtener valores por defecto
export function getDefaultSettings(): AppSettings {
   const defaults = {} as AppSettings;

   for (const [key, definition] of Object.entries(settingsSchema)) {
      (defaults as any)[key] = definition.defaultValue;
   }

   return defaults;
}
