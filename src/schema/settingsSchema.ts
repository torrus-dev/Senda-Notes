// settingsSchema.ts
import type { UiModeType } from "@projectTypes/ui/uiTypes";
import type {
   SettingDefinition,
   SettingCategory,
   SettingsObject,
} from "@projectTypes/core/settingsTypes";

// Definición de categorías
export const SETTING_CATEGORIES: SettingCategory[] = [
   {
      key: "ui",
      label: "Interface",
      description: "Configuración de la interfaz de usuario",
      icon: "🎨",
   },
   {
      key: "editor",
      label: "Editor",
      description: "Configuración del editor de notas",
      icon: "✏️",
   },
   {
      key: "debug",
      label: "Debug",
      description: "Configuración de depuración",
      icon: "🐛",
   },
] as const;

// Definición de todas las configuraciones
export const SETTINGS_SCHEMA = [
   {
      key: "uiMode",
      type: "select",
      defaultValue: "system" as UiModeType,
      label: "UI Mode",
      description: "Tema de la interfaz de usuario",
      category: "ui",
      options: [
         { value: "light", label: "Light" },
         { value: "dark", label: "Dark" },
         { value: "system", label: "System" },
      ],
   },
   {
      key: "showEditorToolbar",
      type: "boolean",
      defaultValue: false,
      label: "Enable Editor Toolbar",
      description: "Muestra la barra de herramientas del editor",
      category: "editor",
   },
   {
      key: "sidebarIsLocked",
      type: "boolean",
      defaultValue: false,
      label: "Lock Sidebar",
      description:
         "Mantiene la barra lateral siempre visible en pantallas grandes",
      category: "ui",
   },
   {
      key: "showMetadata",
      type: "boolean",
      defaultValue: false,
      label: "Show Metadata",
      description: "Muestra los metadatos de la nota en el editor",
      category: "editor",
   },
   {
      key: "debugLevel",
      type: "range",
      defaultValue: 0,
      label: "Debug Level",
      description: "0: none, 1: errors, 2: all",
      category: "debug",
      min: 0,
      max: 2,
      step: 1,
   },
   {
      key: "permanentTabBar",
      type: "boolean",
      defaultValue: true,
      label: "Always show Tab Bar",
      description: "Mantiene la barra de pestañas siempre visible",
      category: "ui",
   },
] as const satisfies readonly SettingDefinition[];

// Tipo generado automáticamente para las configuraciones
export type AppSettings = SettingsObject<typeof SETTINGS_SCHEMA>;

// Funciones de utilidad
export function getDefaultSettings(): AppSettings {
   return SETTINGS_SCHEMA.reduce((acc, setting) => {
      (acc as any)[setting.key] = setting.defaultValue;
      return acc;
   }, {} as AppSettings);
}

export function getSettingDefinition(
   key: string,
): SettingDefinition | undefined {
   return SETTINGS_SCHEMA.find((setting) => setting.key === key);
}

export function getSettingsByCategory(category: string): SettingDefinition[] {
   return SETTINGS_SCHEMA.filter((setting) => setting.category === category);
}

export function validateSetting(key: string, value: any): boolean {
   const setting = getSettingDefinition(key);
   if (!setting) return false;

   if (setting.validation) {
      return setting.validation(value);
   }

   // Validación básica por tipo
   switch (setting.type) {
      case "boolean":
         return typeof value === "boolean";
      case "number":
      case "range":
         if (typeof value !== "number") return false;
         if (setting.min !== undefined && value < setting.min) return false;
         if (setting.max !== undefined && value > setting.max) return false;
         return true;
      case "string":
         if (typeof value !== "string") return false;
         if (
            setting.maxLength !== undefined &&
            value.length > setting.maxLength
         )
            return false;
         return true;
      case "select":
         return setting.options.some((option) => option.value === value);
      default:
         return true;
   }
}
