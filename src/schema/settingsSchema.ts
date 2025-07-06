import type { UiModeType } from "@projectTypes/ui/uiTypes";

// Tipos para el schema
export type SettingType = "boolean" | "number" | "string" | "select";

export interface SettingDefinition<T = any> {
   type: SettingType;
   title: string;
   description: string;
   defaultValue: T;
   options?: string[]; // Para tipo 'select'
   min?: number; // Para tipo 'number'
   max?: number; // Para tipo 'number'
}

export interface SettingsSchema {
   [key: string]: SettingDefinition;
}

// Schema de configuración - aquí defines todo una sola vez
export const settingsSchema = {
   uiMode: {
      title: "UI Mode",
      description: "Select the appearance mode for the application",
      type: "select",
      defaultValue: "system" as UiModeType,
      options: ["system", "light", "dark"] as UiModeType[],
   } as SettingDefinition<UiModeType>,
   showEditorToolbar: {
      title: "Show Editor Toolbar",
      description: "Display the formatting toolbar in the note editor",
      type: "boolean",
      defaultValue: false,
   } as SettingDefinition<boolean>,
   sidebarIsLocked: {
      title: "Lock sidebar on large screens",
      description:
         "Sidebar becomes fixed on larger screens, removing the toggle button",
      type: "boolean",
      defaultValue: false,
   } as SettingDefinition<boolean>,
   showMetadata: {
      title: "Show Metadata",
      description: "Show note metadata in note view",
      type: "boolean",
      defaultValue: false,
   } as SettingDefinition<boolean>,
   debugLevel: {
      title: "Debug Level",
      description:
         "Choose application debug level for warning and error messages",
      type: "number",
      defaultValue: 0,
      min: 0,
      max: 5,
   } as SettingDefinition<number>,
   permanentTabBar: {
      title: "Always show Tab bar",
      description: "Show tabs even with none or only one tab open",
      type: "boolean",
      defaultValue: true,
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
