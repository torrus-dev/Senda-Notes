import { DateTime } from "luxon";
import type { NoteMetadata, NoteStats } from "@projectTypes/core/noteTypes";
import { sanitizeTitle } from "@utils/noteUtils";
import { NoteProperty } from "@projectTypes/data";

/**
 * Entidad rica Note con lógica de negocio
 */
export class Note {
   id: string;
   icon?: string;
   title: string;
   content: string;
   children: string[];
   parentId?: string;
   stats?: NoteStats;
   metadata: NoteMetadata;
   properties: NoteProperty[];

   constructor(data: {
      id: string;
      title: string;
      content: string;
      children?: string[];
      parentId?: string;
      icon?: string;
      stats?: NoteStats;
      metadata: NoteMetadata;
      properties?: NoteProperty[];
   }) {
      this.id = data.id;
      this.title = data.title;
      this.content = data.content;
      this.children = data.children || [];
      this.parentId = data.parentId;
      this.icon = data.icon;
      this.stats = data.stats;
      this.metadata = data.metadata;
      this.properties = data.properties || [];
   }

   /**
    * Actualiza el título de la nota con sanitización
    */
   updateTitle(newTitle: string): void {
      const sanitized = sanitizeTitle(newTitle);
      if (this.title !== sanitized) {
         this.title = sanitized;
         this.updateModified();
      }
   }

   /**
    * Actualiza el contenido de la nota
    */
   updateContent(newContent: string): void {
      if (this.content !== newContent) {
         this.content = newContent;
         this.updateModified();
      }
   }

   /**
    * Actualiza el icono de la nota
    */
   updateIcon(newIcon?: string): void {
      this.icon = newIcon;
      this.updateModified();
   }

   /**
    * Actualiza las estadísticas de la nota
    */
   updateStats(newStats: NoteStats): void {
      this.stats = newStats;
      this.updateModified();
   }

   /**
    * Actualiza contenido y estadísticas en una sola operación
    */
   updateContentWithStats(newContent: string, newStats: NoteStats): void {
      this.content = newContent;
      this.stats = newStats;
      this.updateModified();
   }

   /**
    * Añade un hijo a la nota si no existe
    */
   addChild(childId: string): void {
      if (!this.children.includes(childId)) {
         this.children.push(childId);
         this.updateModified();
      }
   }

   /**
    * Elimina un hijo de la nota
    */
   removeChild(childId: string): void {
      const index = this.children.indexOf(childId);
      if (index !== -1) {
         this.children.splice(index, 1);
         this.updateModified();
      }
   }

   /**
    * Reordena los hijos de la nota
    */
   reorderChildren(orderedChildIds: string[]): void {
      // Validar que sean los mismos IDs
      const currentSet = new Set(this.children);
      const newSet = new Set(orderedChildIds);

      if (
         currentSet.size !== newSet.size ||
         !orderedChildIds.every((id) => currentSet.has(id))
      ) {
         throw new Error("Invalid child IDs for reordering");
      }

      this.children = orderedChildIds;
      this.updateModified();
   }

   /**
    * Inserta un hijo en una posición específica
    */
   insertChildAt(childId: string, position: number): void {
      // Remover si ya existe
      this.removeChild(childId);

      // Insertar en la posición correcta
      const validPosition = Math.max(
         0,
         Math.min(position, this.children.length),
      );
      this.children.splice(validPosition, 0, childId);
      this.updateModified();
   }

   /**
    * Verifica si la nota es raíz (no tiene padre)
    */
   isRoot(): boolean {
      return !this.parentId;
   }

   /**
    * Verifica si la nota tiene hijos
    */
   hasChildren(): boolean {
      return this.children.length > 0;
   }

   /**
    * Verifica si la nota puede moverse a un nuevo padre
    * (sin crear ciclos)
    */
   canMoveTo(newParentId: string | undefined): boolean {
      // No puede moverse a sí misma
      if (newParentId === this.id) {
         return false;
      }

      // Si no hay nuevo padre, siempre puede moverse a raíz
      if (!newParentId) {
         return true;
      }

      // No puede moverse a uno de sus descendientes
      // (esto requeriría acceso a otras notas, se validará externamente)
      return true;
   }

   /**
    * Cambia el padre de la nota
    */
   changeParent(newParentId?: string): void {
      if (this.parentId !== newParentId) {
         this.parentId = newParentId;
         this.updateModified();
      }
   }

   /**
    * Actualiza las propiedades de la nota
    */
   updateProperties(properties: NoteProperty[]): void {
      this.properties = properties;
      this.updateModified();
   }

   /**
    * Añade una propiedad a la nota
    */
   addProperty(property: NoteProperty): void {
      this.properties.push(property);
      this.updateModified();
   }

   /**
    * Elimina una propiedad por ID
    */
   removeProperty(propertyId: string): void {
      const index = this.properties.findIndex((p) => p.id === propertyId);
      if (index !== -1) {
         this.properties.splice(index, 1);
         this.updateModified();
      }
   }

   /**
    * Actualiza una propiedad específica
    */
   updateProperty(propertyId: string, updates: Partial<NoteProperty>): void {
      const property = this.properties.find((p) => p.id === propertyId);
      if (property) {
         Object.assign(property, updates);
         this.updateModified();
      }
   }

   /**
    * Clona la nota (útil para operaciones inmutables)
    */
   clone(): Note {
      return new Note({
         id: this.id,
         title: this.title,
         content: this.content,
         children: [...this.children],
         parentId: this.parentId,
         icon: this.icon,
         stats: this.stats ? { ...this.stats } : undefined,
         metadata: {
            ...this.metadata,
            outgoingLinks: [...this.metadata.outgoingLinks],
            incomingLinks: [...this.metadata.incomingLinks],
            aliases: [...this.metadata.aliases],
         },
         properties: this.properties.map((p) => ({ ...p })),
      });
   }

   /**
    * Convierte la nota a un objeto plano (para persistencia)
    */
   toPlainObject() {
      return {
         id: this.id,
         title: this.title,
         content: this.content,
         children: this.children,
         parentId: this.parentId,
         icon: this.icon,
         stats: this.stats,
         metadata: this.metadata,
         properties: this.properties,
      };
   }

   /**
    * Actualiza el timestamp de modificación
    */
   private updateModified(): void {
      this.metadata.modified = DateTime.now();
   }

   /**
    * Crea una nueva instancia de Note desde un objeto plano
    */
   static fromPlainObject(data: any): Note {
      return new Note({
         id: data.id,
         title: data.title,
         content: data.content,
         children: data.children || [],
         parentId: data.parentId,
         icon: data.icon,
         stats: data.stats,
         metadata: {
            created:
               typeof data.metadata.created === "string"
                  ? DateTime.fromISO(data.metadata.created)
                  : data.metadata.created,
            modified:
               typeof data.metadata.modified === "string"
                  ? DateTime.fromISO(data.metadata.modified)
                  : data.metadata.modified,
            outgoingLinks: data.metadata.outgoingLinks || [],
            incomingLinks: data.metadata.incomingLinks || [],
            aliases: data.metadata.aliases || [],
         },
         properties: data.properties || [],
      });
   }

   /**
    * Crea una nueva nota con valores por defecto
    */
   static create(params: {
      title: string;
      parentId?: string;
      content?: string;
      icon?: string;
   }): Note {
      const now = DateTime.now();
      return new Note({
         id: crypto.randomUUID(),
         title: sanitizeTitle(params.title),
         content: params.content || "",
         parentId: params.parentId,
         icon: params.icon,
         metadata: {
            created: now,
            modified: now,
            outgoingLinks: [],
            incomingLinks: [],
            aliases: [],
         },
      });
   }
}
