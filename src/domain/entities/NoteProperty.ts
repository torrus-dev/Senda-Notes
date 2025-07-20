/**
 * Tipos de propiedades disponibles
 */
export type PropertyType =
   | "text"
   | "number"
   | "list"
   | "check"
   | "date"
   | "datetime";

/**
 * Valores que pueden tener las propiedades (unión de todos los tipos posibles)
 */
export type PropertyValue = string | number | string[] | boolean;

/**
 * Clase base abstracta para todas las propiedades de nota
 */
abstract class BaseNoteProperty {
   id: string;
   name: string;
   abstract type: PropertyType;
   abstract value: any;
   noteId: string;
   globalPropertyId?: string;

   constructor(data: {
      id: string;
      name: string;
      noteId: string;
      globalPropertyId?: string;
   }) {
      this.id = data.id;
      this.name = data.name;
      this.noteId = data.noteId;
      this.globalPropertyId = data.globalPropertyId;
   }

   /**
    * Actualiza el nombre de la propiedad
    */
   updateName(newName: string): void {
      const trimmedName = newName.trim();
      if (this.name !== trimmedName) {
         this.name = trimmedName;
      }
   }

   /**
    * Vincula la propiedad a una propiedad global
    */
   linkToGlobal(globalPropertyId: string): void {
      this.globalPropertyId = globalPropertyId;
   }

   /**
    * Desvincula la propiedad de la propiedad global
    */
   unlinkFromGlobal(): void {
      this.globalPropertyId = undefined;
   }

   /**
    * Verifica si la propiedad está vinculada a una propiedad global
    */
   isLinkedToGlobal(): boolean {
      return this.globalPropertyId !== undefined;
   }

   /**
    * Verifica si la propiedad está vinculada a una propiedad global específica
    */
   isLinkedToGlobalProperty(globalPropertyId: string): boolean {
      return this.globalPropertyId === globalPropertyId;
   }

   /**
    * Actualiza la propiedad con datos de una propiedad global
    */
   syncWithGlobal(globalName: string, globalType: PropertyType): void {
      this.name = globalName;
      // No forzamos el cambio de tipo, solo actualizamos el nombre
      // El tipo se mantendrá para mostrar advertencias de desajuste en la UI
   }

   /**
    * Verifica si el tipo coincide con el tipo esperado
    */
   hasTypeMatch(expectedType: PropertyType): boolean {
      return this.type === expectedType;
   }

   /**
    * Verifica si el nombre es válido (no vacío después del trim)
    */
   hasValidName(): boolean {
      return this.name.trim().length > 0;
   }

   /**
    * Obtiene el nombre normalizado para comparaciones
    */
   getNormalizedName(): string {
      return this.name.trim().toLowerCase();
   }

   /**
    * Verifica si tiene el mismo nombre que otra propiedad (normalizado)
    */
   hasSameNameAs(otherProperty: BaseNoteProperty): boolean {
      return this.getNormalizedName() === otherProperty.getNormalizedName();
   }

   /**
    * Verifica si tiene el mismo nombre que un string dado (normalizado)
    */
   hasName(name: string): boolean {
      return this.getNormalizedName() === name.trim().toLowerCase();
   }

   /**
    * Convierte la propiedad a un objeto plano (para persistencia)
    */
   toPlainObject() {
      return {
         id: this.id,
         name: this.name,
         type: this.type,
         value: this.value,
         noteId: this.noteId,
         globalPropertyId: this.globalPropertyId,
      };
   }
}

/**
 * Propiedad de texto
 */
export class TextProperty extends BaseNoteProperty {
   type: "text" = "text";
   value: string;

   constructor(data: {
      id: string;
      name: string;
      noteId: string;
      value?: string;
      globalPropertyId?: string;
   }) {
      super(data);
      this.value = data.value ?? "";
   }

   updateValue(newValue: string): void {
      this.value = newValue;
   }

   clone(): TextProperty {
      return new TextProperty({
         id: this.id,
         name: this.name,
         noteId: this.noteId,
         value: this.value,
         globalPropertyId: this.globalPropertyId,
      });
   }
}

/**
 * Propiedad numérica
 */
export class NumberProperty extends BaseNoteProperty {
   type: "number" = "number";
   value: number;

   constructor(data: {
      id: string;
      name: string;
      noteId: string;
      value?: number;
      globalPropertyId?: string;
   }) {
      super(data);
      this.value = data.value ?? 0;
   }

   updateValue(newValue: number): void {
      this.value = newValue;
   }

   clone(): NumberProperty {
      return new NumberProperty({
         id: this.id,
         name: this.name,
         noteId: this.noteId,
         value: this.value,
         globalPropertyId: this.globalPropertyId,
      });
   }
}

/**
 * Propiedad de lista
 */
export class ListProperty extends BaseNoteProperty {
   type: "list" = "list";
   value: string[];

   constructor(data: {
      id: string;
      name: string;
      noteId: string;
      value?: string[];
      globalPropertyId?: string;
   }) {
      super(data);
      this.value = data.value ?? [];
   }

   updateValue(newValue: string[]): void {
      this.value = newValue;
   }

   addItem(item: string): void {
      if (!this.value.includes(item)) {
         this.value.push(item);
      }
   }

   removeItem(item: string): void {
      const index = this.value.indexOf(item);
      if (index !== -1) {
         this.value.splice(index, 1);
      }
   }

   clone(): ListProperty {
      return new ListProperty({
         id: this.id,
         name: this.name,
         noteId: this.noteId,
         value: [...this.value],
         globalPropertyId: this.globalPropertyId,
      });
   }
}

/**
 * Propiedad de checkbox/booleana
 */
export class CheckProperty extends BaseNoteProperty {
   type: "check" = "check";
   value: boolean;

   constructor(data: {
      id: string;
      name: string;
      noteId: string;
      value?: boolean;
      globalPropertyId?: string;
   }) {
      super(data);
      this.value = data.value ?? false;
   }

   updateValue(newValue: boolean): void {
      this.value = newValue;
   }

   toggle(): void {
      this.value = !this.value;
   }

   clone(): CheckProperty {
      return new CheckProperty({
         id: this.id,
         name: this.name,
         noteId: this.noteId,
         value: this.value,
         globalPropertyId: this.globalPropertyId,
      });
   }
}

/**
 * Propiedad de fecha
 */
export class DateProperty extends BaseNoteProperty {
   type: "date" = "date";
   value: string;

   constructor(data: {
      id: string;
      name: string;
      noteId: string;
      value?: string;
      globalPropertyId?: string;
   }) {
      super(data);
      this.value = data.value ?? "";
   }

   updateValue(newValue: string): void {
      this.value = newValue;
   }

   clone(): DateProperty {
      return new DateProperty({
         id: this.id,
         name: this.name,
         noteId: this.noteId,
         value: this.value,
         globalPropertyId: this.globalPropertyId,
      });
   }
}

/**
 * Propiedad de fecha y hora
 */
export class DatetimeProperty extends BaseNoteProperty {
   type: "datetime" = "datetime";
   value: string;

   constructor(data: {
      id: string;
      name: string;
      noteId: string;
      value?: string;
      globalPropertyId?: string;
   }) {
      super(data);
      this.value = data.value ?? "";
   }

   updateValue(newValue: string): void {
      this.value = newValue;
   }

   clone(): DatetimeProperty {
      return new DatetimeProperty({
         id: this.id,
         name: this.name,
         noteId: this.noteId,
         value: this.value,
         globalPropertyId: this.globalPropertyId,
      });
   }
}

/**
 * Union type de todas las propiedades de nota
 */
export type NoteProperty =
   | TextProperty
   | NumberProperty
   | ListProperty
   | CheckProperty
   | DateProperty
   | DatetimeProperty;

/**
 * Factory para crear propiedades según el tipo
 */
export class NotePropertyFactory {
   static create(params: {
      type: PropertyType;
      name: string;
      noteId: string;
      value?: PropertyValue;
      globalPropertyId?: string;
   }): NoteProperty {
      const baseData = {
         id: crypto.randomUUID(),
         name: params.name.trim(),
         noteId: params.noteId,
         globalPropertyId: params.globalPropertyId,
      };

      switch (params.type) {
         case "text":
            return new TextProperty({
               ...baseData,
               value: typeof params.value === "string" ? params.value : "",
            });
         case "number":
            return new NumberProperty({
               ...baseData,
               value: typeof params.value === "number" ? params.value : 0,
            });
         case "list":
            return new ListProperty({
               ...baseData,
               value: Array.isArray(params.value) ? params.value : [],
            });
         case "check":
            return new CheckProperty({
               ...baseData,
               value: typeof params.value === "boolean" ? params.value : false,
            });
         case "date":
            return new DateProperty({
               ...baseData,
               value: typeof params.value === "string" ? params.value : "",
            });
         case "datetime":
            return new DatetimeProperty({
               ...baseData,
               value: typeof params.value === "string" ? params.value : "",
            });
         default:
            throw new Error(`Unknown property type: ${params.type}`);
      }
   }

   static fromPlainObject(data: any): NoteProperty {
      const baseData = {
         id: data.id,
         name: data.name,
         noteId: data.noteId,
         globalPropertyId: data.globalPropertyId,
      };

      switch (data.type) {
         case "text":
            return new TextProperty({
               ...baseData,
               value: data.value ?? "",
            });
         case "number":
            return new NumberProperty({
               ...baseData,
               value: data.value ?? 0,
            });
         case "list":
            return new ListProperty({
               ...baseData,
               value: data.value ?? [],
            });
         case "check":
            return new CheckProperty({
               ...baseData,
               value: data.value ?? false,
            });
         case "date":
            return new DateProperty({
               ...baseData,
               value: data.value ?? "",
            });
         case "datetime":
            return new DatetimeProperty({
               ...baseData,
               value: data.value ?? "",
            });
         default:
            throw new Error(`Unknown property type: ${data.type}`);
      }
   }
}
