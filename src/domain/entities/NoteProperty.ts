/**
 * Entidad rica NoteProperty con lógica de negocio
 */
export class NoteProperty {
   readonly id: string;
   name: string;
   type: string;
   value: any;
   noteId: string;
   globalPropertyId?: string;

   constructor(data: {
      id: string;
      name: string;
      type: string;
      value?: any;
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
    * Actualiza el tipo de la propiedad
    */
   updateType(newType: string): void {
      if (this.type !== newType) {
         this.type = newType;
         // Al cambiar el tipo, podríamos necesitar limpiar el valor si no es compatible
         this.validateValueForType(newType);
      }
   }

   /**
    * Actualiza el valor de la propiedad
    */
   updateValue(newValue: any): void {
      this.value = newValue;
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
   syncWithGlobal(globalName: string, globalType: string): void {
      this.name = globalName;
      // No forzamos el cambio de tipo, solo actualizamos el nombre
      // El tipo se mantendrá para mostrar advertencias de desajuste en la UI
   }

   /**
    * Verifica si el tipo coincide con el tipo esperado
    */
   hasTypeMatch(expectedType: string): boolean {
      return this.type === expectedType;
   }

   /**
    * Valida si el valor es compatible con el tipo
    */
   private validateValueForType(type: string): void {
      // Aquí se pueden agregar validaciones específicas según el tipo
      // Por ejemplo, si el tipo es "number" y el valor no es numérico
      switch (type) {
         case "number":
            if (
               this.value !== undefined &&
               this.value !== "" &&
               isNaN(Number(this.value))
            ) {
               this.value = undefined; // Limpiar valor incompatible
            }
            break;
         case "boolean":
            if (this.value !== undefined && typeof this.value !== "boolean") {
               this.value = undefined;
            }
            break;
         case "date":
            if (
               this.value !== undefined &&
               !(this.value instanceof Date) &&
               isNaN(Date.parse(this.value))
            ) {
               this.value = undefined;
            }
            break;
         // Agregar más validaciones según los tipos soportados
      }
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
   hasSameNameAs(otherProperty: NoteProperty): boolean {
      return this.getNormalizedName() === otherProperty.getNormalizedName();
   }

   /**
    * Verifica si tiene el mismo nombre que un string dado (normalizado)
    */
   hasName(name: string): boolean {
      return this.getNormalizedName() === name.trim().toLowerCase();
   }

   /**
    * Clona la propiedad (útil para operaciones inmutables)
    */
   clone(): NoteProperty {
      return new NoteProperty({
         id: this.id,
         name: this.name,
         type: this.type,
         value: this.value,
         noteId: this.noteId,
         globalPropertyId: this.globalPropertyId,
      });
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

   /**
    * Crea una nueva instancia de NoteProperty desde un objeto plano
    */
   static fromPlainObject(data: any): NoteProperty {
      return new NoteProperty({
         id: data.id,
         name: data.name,
         type: data.type,
         value: data.value,
         noteId: data.noteId,
         globalPropertyId: data.globalPropertyId,
      });
   }

   /**
    * Crea una nueva propiedad de nota con valores por defecto
    */
   static create(params: {
      name: string;
      type: string;
      noteId: string;
      value?: any;
      globalPropertyId?: string;
   }): NoteProperty {
      return new NoteProperty({
         id: crypto.randomUUID(),
         name: params.name.trim(),
         type: params.type,
         value: params.value,
         noteId: params.noteId,
         globalPropertyId: params.globalPropertyId,
      });
   }
}
