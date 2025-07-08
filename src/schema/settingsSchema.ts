import type { UiModeType } from "@projectTypes/ui/uiTypes";
import { normalizeText } from "@utils/searchUtils";

// Tipos para el schema
export type SettingType = "boolean" | "number" | "string" | "select";
export type SettingCategory = "ui" | "dev" | "app";

export interface SettingDefinition<T = any> {
   type: SettingType;
   title: string;
   description: string;
   defaultValue: T;
   category: SettingCategory;
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
      category: "ui",
      defaultValue: "system" as UiModeType,
      options: ["system", "light", "dark"] as UiModeType[],
   } as SettingDefinition<UiModeType>,
   showEditorToolbar: {
      title: "Show Editor Toolbar",
      description: "Display the formatting toolbar in the note editor",
      type: "boolean",
      category: "ui",
      defaultValue: false,
   } as SettingDefinition<boolean>,
   sidebarIsLocked: {
      title: "Lock sidebar on large screens",
      description:
         "Sidebar becomes fixed on larger screens, removing the toggle button",
      type: "boolean",
      category: "ui",
      defaultValue: false,
   } as SettingDefinition<boolean>,
   showMetadata: {
      title: "Show Metadata",
      description: "Show note metadata in note view",
      type: "boolean",
      category: "ui",
      defaultValue: false,
   } as SettingDefinition<boolean>,
   permanentTabBar: {
      title: "Always show Tab bar",
      description: "Show tabs even with none or only one tab open",
      type: "boolean",
      category: "ui",
      defaultValue: true,
   } as SettingDefinition<boolean>,
   debugLevel: {
      title: "Debug Level",
      description:
         "Choose application debug level for warning and error messages",
      type: "number",
      category: "dev",
      defaultValue: 0,
      min: 0,
      max: 5,
   } as SettingDefinition<number>,
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

// Función helper para obtener configuraciones por categoría
export function getSettingsByCategory(
   category: SettingCategory,
   searchQuery?: string,
): Array<{ key: SettingsKey; setting: SettingDefinition }> {
   let results = Object.entries(settingsSchema)
      .filter(([_, setting]) => setting.category === category)
      .map(([key, setting]) => ({ key: key as SettingsKey, setting }));

   // Si no hay query de búsqueda, devolver todos los resultados
   if (!searchQuery || searchQuery.trim() === "") {
      return results;
   }

   const normalizedQuery = normalizeText(searchQuery.trim());

   return results.filter(({ key, setting }) => {
      const normalizedTitle = normalizeText(setting.title);
      const normalizedDescription = normalizeText(setting.description);
      const normalizedKey = normalizeText(key);

      return (
         normalizedTitle.includes(normalizedQuery) ||
         normalizedDescription.includes(normalizedQuery) ||
         normalizedKey.includes(normalizedQuery)
      );
   });
}

// Función helper para obtener todas las categorías únicas
export function getCategories(): SettingCategory[] {
   const categories = new Set<SettingCategory>();
   Object.values(settingsSchema).forEach((setting) =>
      categories.add(setting.category),
   );
   return Array.from(categories);
}
