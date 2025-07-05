// settingsTypes.ts

export interface SettingOption {
   value: string | number;
   label: string;
}

export interface SettingCategory {
   key: string;
   label: string;
   description?: string;
   icon?: string;
}

// Base común para todas las configuraciones
interface BaseSettingDefinition {
   key: string;
   label: string;
   description?: string;
   category?: string;
   validation?: (value: any) => boolean;
}

// Configuración booleana
export interface BooleanSettingDefinition extends BaseSettingDefinition {
   type: "boolean";
   defaultValue: boolean;
}

// Configuración numérica
export interface NumberSettingDefinition extends BaseSettingDefinition {
   type: "number";
   defaultValue: number;
   min?: number;
   max?: number;
   step?: number;
}

// Configuración de rango/slider
export interface RangeSettingDefinition extends BaseSettingDefinition {
   type: "range";
   defaultValue: number;
   min: number;
   max: number;
   step?: number;
}

// Configuración de texto
export interface StringSettingDefinition extends BaseSettingDefinition {
   type: "string";
   defaultValue: string;
   maxLength?: number;
   placeholder?: string;
}

// Configuración de selección
export interface SelectSettingDefinition extends BaseSettingDefinition {
   type: "select";
   defaultValue: string | number;
   options: SettingOption[];
}

// Unión de todos los tipos de configuración
export type SettingDefinition =
   | BooleanSettingDefinition
   | NumberSettingDefinition
   | RangeSettingDefinition
   | StringSettingDefinition
   | SelectSettingDefinition;

// Tipo para extraer el valor por defecto basado en la definición
export type DefaultValueOf<T extends SettingDefinition> = T["defaultValue"];

// Tipo para el objeto de configuraciones completo
export type SettingsObject<T extends readonly SettingDefinition[]> = {
   [K in T[number]["key"]]: DefaultValueOf<Extract<T[number], { key: K }>>;
};
