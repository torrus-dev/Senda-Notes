import { DateTime } from "luxon";
import type { NoteStats, NoteReference } from "@projectTypes/core/noteTypes";
import type { NoteProperty } from "@projectTypes/data";

export class NoteEntity {
   readonly id: string;
   private _icon?: string;
   private _title: string;
   private _content: string;
   private _children: string[];
   private _parentId?: string;
   private _stats?: NoteStats;
   private _metadata: {
      created: DateTime;
      modified: DateTime;
      outgoingLinks: NoteReference[];
      incomingLinks: NoteReference[];
      aliases: string[];
   };
   private _properties: NoteProperty[];

   private constructor(
      id: string,
      title: string,
      content: string,
      metadata: NoteEntity["_metadata"],
      properties: NoteProperty[],
      children: string[] = [],
      parentId?: string,
      icon?: string,
      stats?: NoteStats,
   ) {
      this.id = id;
      this._title = title;
      this._content = content;
      this._metadata = metadata;
      this._properties = properties;
      this._children = children;
      this._parentId = parentId;
      this._icon = icon;
      this._stats = stats;
   }

   /** Fábrica para crear una nota nueva */
   static create(
      rawTitle: string,
      existingTitles: Set<string>,
      parentId?: string,
   ): NoteEntity {
      // Generar ID y título único
      const id = crypto.randomUUID();
      let title = rawTitle.trim() || "Untitled";
      let suffix = 1;
      while (existingTitles.has(title)) {
         suffix += 1;
         title = `${rawTitle.trim()} (${suffix})`;
      }

      const now = DateTime.now();
      const metadata = {
         created: now,
         modified: now,
         outgoingLinks: [],
         incomingLinks: [],
         aliases: [],
      };

      return new NoteEntity(id, title, "", metadata, [], [], parentId);
   }

   /** Renombrar la nota (con saneamiento y versión única) */
   rename(newTitle: string, existingTitles: Set<string>): void {
      const sane = newTitle.trim() || this._title;
      let finalTitle = sane;
      let suffix = 1;
      while (existingTitles.has(finalTitle) && finalTitle !== this._title) {
         suffix += 1;
         finalTitle = `${sane} (${suffix})`;
      }
      if (finalTitle !== this._title) {
         this._title = finalTitle;
         this.touch();
      }
   }

   /** Actualizar contenido */
   updateContent(newContent: string): void {
      if (newContent !== this._content) {
         this._content = newContent;
         this.touch();
      }
   }

   /** Añadir o quitar hijo */
   addChild(childId: string): void {
      if (!this._children.includes(childId)) {
         this._children.push(childId);
         this.touch();
      }
   }
   removeChild(childId: string): void {
      const idx = this._children.indexOf(childId);
      if (idx >= 0) {
         this._children.splice(idx, 1);
         this.touch();
      }
   }

   /** Métodos sobre properties */
   addProperty(prop: NoteProperty): void {
      this._properties.push(prop);
      this.touch();
   }
   updateProperty(updated: NoteProperty): void {
      const idx = this._properties.findIndex((p) => p.id === updated.id);
      if (idx >= 0) {
         this._properties[idx] = updated;
         this.touch();
      }
   }
   deleteProperty(propId: string): void {
      this._properties = this._properties.filter((p) => p.id !== propId);
      this.touch();
   }

   /** Interno: actualizar timestamp */
   private touch(): void {
      this._metadata.modified = DateTime.now();
   }

   /** Exportar a DTO plano */
   toDTO(): {
      id: string;
      icon?: string;
      title: string;
      content: string;
      children: string[];
      parentId?: string;
      stats?: NoteStats;
      metadata: NoteEntity["_metadata"];
      properties: NoteProperty[];
   } {
      return {
         id: this.id,
         icon: this._icon,
         title: this._title,
         content: this._content,
         children: [...this._children],
         parentId: this._parentId,
         stats: this._stats,
         metadata: { ...this._metadata },
         properties: [...this._properties],
      };
   }
}
