import type { DateTime } from "luxon";

interface BaseProperty {
   id: string; // con crypto.randomUUID()
   name: string;
}

/** Propiedad de texto sencillo */
export interface TextProperty extends BaseProperty {
   type: "text";
   value: string;
}

/** Propiedad de lista de textos */
export interface ListProperty extends BaseProperty {
   type: "list";
   value: string[];
}

/** Propiedad numérica */
export interface NumberProperty extends BaseProperty {
   type: "number";
   value: number;
}

/** Propiedad de casilla (true/false) */
export interface CheckProperty extends BaseProperty {
   type: "check";
   value: boolean;
}

/** Propiedad de fecha (solo fecha) */
export interface DateProperty extends BaseProperty {
   type: "date";
   value: Date;
}

/** Propiedad de fecha y hora */
export interface DateTimeProperty extends BaseProperty {
   type: "datetime";
   value: DateTime;
}

/** Unión de todos los tipos de propiedad */
export type Property =
   | TextProperty
   | ListProperty
   | NumberProperty
   | CheckProperty
   | DateProperty
   | DateTimeProperty;

export interface GlobalProperty {
   id: Property["name"];
   name: Property["name"];
   type: Property["type"];
   linkedProperties: Property["id"][];
   createdAt: DateTime;
   updatedAt: DateTime;
}
