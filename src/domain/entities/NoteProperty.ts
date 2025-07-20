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
 * Valores que pueden tener las propiedades
 */
export type PropertyValue = string | number | string[] | boolean;

/**
 * Entidad NoteProperty simplificada con discriminated union
 */
export class NoteProperty {
   id: string;
   name: string;
   type: PropertyType;
   value: PropertyValue;
   noteId: string;
   globalPropertyId?: string;

   constructor(data: {
      id: string;
      name: string;
      type: PropertyType;
      value: PropertyValue;
      noteId: string;
      globalPropertyId?: string;
   }) {
      this.id = data.id;
      this.name = data.name;
      this.type = data.type;
      this.value = data.value;
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
    * Actualiza el valor con validación de tipo
    */
   updateValue(newValue: PropertyValue): void {
      if (this.isValidValueForType(newValue, this.type)) {
         this.value = newValue;
      } else {
         throw new Error(
            `Value ${newValue} is not valid for type ${this.type}`,
         );
      }
   }

   /**
    * Actualiza el tipo y resetea el valor si es necesario
    */
   updateType(newType: PropertyType): void {
      if (this.type !== newType) {
         this.type = newType;
         this.value = this.getDefaultValueForType(newType);
      }
   }

   /**
    * Vinculación con propiedades globales
    */
   linkToGlobal(globalPropertyId: string): void {
      this.globalPropertyId = globalPropertyId;
   }

   unlinkFromGlobal(): void {
      this.globalPropertyId = undefined;
   }

   isLinkedToGlobal(): boolean {
      return this.globalPropertyId !== undefined;
   }

   isLinkedToGlobalProperty(globalPropertyId: string): boolean {
      return this.globalPropertyId === globalPropertyId;
   }

   /**
    * Sincronización con propiedades globales
    */
   syncWithGlobal(globalName: string, globalType: PropertyType): void {
      this.name = globalName;
      // Opcionalmente actualizar tipo (puede generar advertencia en UI si no coincide)
   }

   hasTypeMatch(expectedType: PropertyType): boolean {
      return this.type === expectedType;
   }

   /**
    * Validaciones
    */
   hasValidName(): boolean {
      return this.name.trim().length > 0;
   }

   getNormalizedName(): string {
      return this.name.trim().toLowerCase();
   }

   hasSameNameAs(otherProperty: NoteProperty): boolean {
      return this.getNormalizedName() === otherProperty.getNormalizedName();
   }

   hasName(name: string): boolean {
      return this.getNormalizedName() === name.trim().toLowerCase();
   }

   /**
    * Utilidades privadas
    */
   private isValidValueForType(
      value: PropertyValue,
      type: PropertyType,
   ): boolean {
      switch (type) {
         case "text":
         case "date":
         case "datetime":
            return typeof value === "string";
         case "number":
            return typeof value === "number";
         case "list":
            return (
               Array.isArray(value) &&
               value.every((item) => typeof item === "string")
            );
         case "check":
            return typeof value === "boolean";
         default:
            return false;
      }
   }

   private getDefaultValueForType(type: PropertyType): PropertyValue {
      switch (type) {
         case "text":
         case "date":
         case "datetime":
            return "";
         case "number":
            return 0;
         case "list":
            return [];
         case "check":
            return false;
         default:
            return "";
      }
   }

   /**
    * Métodos de conveniencia para tipos específicos
    */

   // Para listas
   addListItem(item: string): void {
      if (this.type === "list" && Array.isArray(this.value)) {
         if (!this.value.includes(item)) {
            this.value.push(item);
         }
      }
   }

   removeListItem(item: string): void {
      if (this.type === "list" && Array.isArray(this.value)) {
         const index = this.value.indexOf(item);
         if (index !== -1) {
            this.value.splice(index, 1);
         }
      }
   }

   // Para checkboxes
   toggle(): void {
      if (this.type === "check") {
         this.value = !this.value;
      }
   }

   /**
    * Serialización
    */
   clone(): NoteProperty {
      return new NoteProperty({
         id: this.id,
         name: this.name,
         type: this.type,
         value: Array.isArray(this.value) ? [...this.value] : this.value,
         noteId: this.noteId,
         globalPropertyId: this.globalPropertyId,
      });
   }

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

   /**
    * Factory methods estáticos
    */
   static fromPlainObject(data: any): NoteProperty {
      return new NoteProperty({
         id: data.id,
         name: data.name,
         type: data.type,
         value: data.value ?? NoteProperty.getDefaultValueForType(data.type),
         noteId: data.noteId,
         globalPropertyId: data.globalPropertyId,
      });
   }

   static create(params: {
      name: string;
      type: PropertyType;
      noteId: string;
      value?: PropertyValue;
      globalPropertyId?: string;
   }): NoteProperty {
      return new NoteProperty({
         id: crypto.randomUUID(),
         name: params.name.trim(),
         type: params.type,
         value:
            params.value ?? NoteProperty.getDefaultValueForType(params.type),
         noteId: params.noteId,
         globalPropertyId: params.globalPropertyId,
      });
   }

   static getDefaultValueForType(type: PropertyType): PropertyValue {
      switch (type) {
         case "text":
         case "date":
         case "datetime":
            return "";
         case "number":
            return 0;
         case "list":
            return [];
         case "check":
            return false;
         default:
            return "";
      }
   }
}
