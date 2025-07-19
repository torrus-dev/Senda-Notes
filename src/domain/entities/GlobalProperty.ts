import { DateTime } from "luxon";

export interface GlobalPropertyLink {
   noteId: string;
   propertyId: string;
}

export interface GlobalPropertyMetadata {
   created: DateTime;
   modified: DateTime;
}

/**
 * Entidad rica GlobalProperty con lógica de negocio
 */
export class GlobalProperty {
   readonly id: string;
   name: string;
   type: string;
   linkedProperties: GlobalPropertyLink[];
   metadata: GlobalPropertyMetadata;

   constructor(data: {
      id: string;
      name: string;
      type: string;
      linkedProperties?: GlobalPropertyLink[];
      metadata: GlobalPropertyMetadata;
   }) {
      this.id = data.id;
      this.name = data.name;
      this.type = data.type;
      this.linkedProperties = data.linkedProperties || [];
      this.metadata = data.metadata;
   }

   /**
    * Actualiza el nombre de la propiedad global
    */
   updateName(newName: string): void {
      const trimmedName = newName.trim();
      if (this.name !== trimmedName) {
         this.name = trimmedName;
         this.updateModified();
      }
   }

   /**
    * Actualiza el tipo de la propiedad global
    */
   updateType(newType: string): void {
      if (this.type !== newType) {
         this.type = newType;
         this.updateModified();
      }
   }

   /**
    * Añade un enlace a una propiedad de nota si no existe
    */
   addLink(noteId: string, propertyId: string): void {
      if (!this.isLinkedTo(noteId, propertyId)) {
         this.linkedProperties.push({ noteId, propertyId });
         this.updateModified();
      }
   }

   /**
    * Elimina un enlace a una propiedad de nota
    */
   removeLink(noteId: string, propertyId: string): void {
      const index = this.linkedProperties.findIndex(
         (link) => link.noteId === noteId && link.propertyId === propertyId,
      );

      if (index !== -1) {
         this.linkedProperties.splice(index, 1);
         this.updateModified();
      }
   }

   /**
    * Verifica si existe un enlace específico
    */
   isLinkedTo(noteId: string, propertyId: string): boolean {
      return this.linkedProperties.some(
         (link) => link.noteId === noteId && link.propertyId === propertyId,
      );
   }

   /**
    * Verifica si la propiedad global tiene enlaces
    */
   hasLinks(): boolean {
      return this.linkedProperties.length > 0;
   }

   /**
    * Verifica si la propiedad global está vinculada a una nota específica
    */
   isLinkedToNote(noteId: string): boolean {
      return this.linkedProperties.some((link) => link.noteId === noteId);
   }

   /**
    * Obtiene todos los enlaces de una nota específica
    */
   getLinksForNote(noteId: string): GlobalPropertyLink[] {
      return this.linkedProperties.filter((link) => link.noteId === noteId);
   }

   /**
    * Elimina todos los enlaces de una nota específica
    */
   removeAllLinksForNote(noteId: string): void {
      const initialLength = this.linkedProperties.length;
      this.linkedProperties = this.linkedProperties.filter(
         (link) => link.noteId !== noteId,
      );

      if (this.linkedProperties.length !== initialLength) {
         this.updateModified();
      }
   }

   /**
    * Verifica si se puede eliminar (no tiene enlaces)
    */
   canBeDeleted(): boolean {
      return !this.hasLinks();
   }

   /**
    * Cuenta el número de enlaces
    */
   getLinkCount(): number {
      return this.linkedProperties.length;
   }

   /**
    * Clona la propiedad global (útil para operaciones inmutables)
    */
   clone(): GlobalProperty {
      return new GlobalProperty({
         id: this.id,
         name: this.name,
         type: this.type,
         linkedProperties: this.linkedProperties.map((link) => ({ ...link })),
         metadata: {
            created: this.metadata.created,
            modified: this.metadata.modified,
         },
      });
   }

   /**
    * Convierte la propiedad global a un objeto plano (para persistencia)
    */
   toPlainObject() {
      return {
         id: this.id,
         name: this.name,
         type: this.type,
         linkedProperties: this.linkedProperties,
         metadata: this.metadata,
      };
   }

   /**
    * Actualiza el timestamp de modificación
    */
   private updateModified(): void {
      this.metadata.modified = DateTime.now();
   }

   /**
    * Crea una nueva instancia de GlobalProperty desde un objeto plano
    */
   static fromPlainObject(data: any): GlobalProperty {
      return new GlobalProperty({
         id: data.id,
         name: data.name,
         type: data.type,
         linkedProperties: data.linkedProperties || [],
         metadata: {
            created:
               typeof data.metadata.created === "string"
                  ? DateTime.fromISO(data.metadata.created)
                  : data.metadata.created,
            modified:
               typeof data.metadata.modified === "string"
                  ? DateTime.fromISO(data.metadata.modified)
                  : data.metadata.modified,
         },
      });
   }

   /**
    * Crea una nueva propiedad global con valores por defecto
    */
   static create(params: { name: string; type: string }): GlobalProperty {
      const now = DateTime.now();
      return new GlobalProperty({
         id: crypto.randomUUID(),
         name: params.name.trim(),
         type: params.type,
         metadata: {
            created: now,
            modified: now,
         },
      });
   }
}
