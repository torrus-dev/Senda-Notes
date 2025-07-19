# Migración de arquitectura - Sistema de Propiedades

## Contexto

Estoy migrando una aplicación tipo Notion local (Svelte + Electron) de una arquitectura con controladores gordos + modelos anémicos hacia una arquitectura ligera inspirada en DDD.

La aplicación es un proyecto hobbie, no es algo profesional y es individual, por eso prefiero la simpleza a la complejidad.

Ya he migrado exitosamente el sistema de Notas con esta estructura (tambien te incluyo la ubicación de los controladores relacionados con propiedades)

```
src
   └── application
       └── usecases
           └── NoteUseCases.ts
   └── controllers
       └── notes
           ├── noteController.svelte.ts
           ├── noteQueryController.svelte.ts
       └── property
           ├── globalPropertyController.svelte.ts
           └── notePropertyController.svelte.ts
       └── // demas controladores...
   └── directives
       ├── floatingMenuDirective.svelte.ts
       ├── onClickOutside.ts
       └── onPressEsc.ts
   └── domain
       └── entities
           ├── Note.ts
       └── services
           ├── NotePathService.ts
           └── NoteTreeService.ts
 └── infrastructure
     └── persistence
         ├── JsonFileAdapter.svelte.ts
         └── LocalStorageAdapter.svelte.ts
     └── repositories
         ├── FavoritesRepository.ts
         ├── NoteQueryRepository.ts
         └── NoteRepository.ts
```

domain/entity/Note.ts

```
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
```

## Funcionamiento de las propiedades

Es un sistema muy similar a las propiedades en Obsidian.

Existen las NoteProperty y GlobalProperty, son sistemas paralelos que se complementan.

Las NoteProperty viven dentro de una Note. Al crear o renombrar una NoteProperty con un titulo que no existe en otra Note, se crea una GlobalProperty.
Las GlobalProperty son un registro global de las propiedades que existen en la aplicación, tienen una vinculación con una o varias NoteProperty.

El nombre se utiliza para la vinculación entre los dos sistemas:
Al introducir el nombre de una NoteProperty hay una lista de sugerencias a partir de las GlobalProperty que no esten en la nota actua.
Si el nombre ya existe se escoje el tipo de la GlobalProperty automaticamente.
Renombrarse una GlobalProperty, cambia el nombre de todas las NoteProperty asociadas.
Renombrar una NoteProperty desvincula la GlobalProperty y se crea una nueva si no existen con ese nombre o se vincula a la GlobalProperty que corresponda.
No se pueden repetir NoteProperty con el mismo nombre en una Note.

El tipo de las GlobalProperty se puede cambiar, el tipo es el tipo que espera que haya en las NoteProperty asociadas, tiene una "vinculación suave", no fuerza el cambio en las NoteProperty, solo se muestra un aviso si el tipo / valor no coincide.
Al cambiar el tipo de una NoteProperty cambiamos tambien el tipo esperado de la GlobalProperty

Las NoteProperty se visualizan en las notas. Las GlobalProperty tienen un menu propio para renombrarlas y cambiar su tipo

En el futuro las GlobalProperty serviran tambien para sugerir al usuario valores ya usados en esa propiedad (solo en algunos tipos de propiedad)

## Entidad Note relevante

```typescript
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
```

## Controladores actuales a migrar

NotePropertyController

```
import type { NoteProperty } from "@projectTypes/core/propertyTypes";
import type { Note } from "@domain/entities/Note";
import { globalPropertyController } from "@controllers/property/globalPropertyController.svelte";
import { startupManager } from "@infrastructure/startup/startupManager.svelte";
import { generateProperty } from "@utils/propertyUtils";
import { normalizeText } from "@utils/searchUtils";

class NotePropertyController {
   private get noteRepository() {
      return startupManager.getService("noteRepository");
   }

   private get queryRepository() {
      return startupManager.getService("noteQueryRepository");
   }

   private addPropertyToNote = (noteId: string, newProperty: NoteProperty) => {
      const note = this.queryRepository.findById(noteId);
      if (!note) return;

      note.addProperty(newProperty);
      this.noteRepository.update(noteId, note);
   };

   /** Devuelve true si ya existe en la nota otra propiedad con ese nombre */
   isDuplicateName(
      noteId: string,
      name: string,
      excludePropertyId?: NoteProperty["id"],
   ): boolean {
      const props = this.getNoteProperties(noteId);
      const normalized = normalizeText(name.trim());
      return props
         .filter((p) => p.id !== excludePropertyId)
         .some((p) => normalizeText(p.name.trim()) === normalized);
   }

   handleCreateNoteProperty = (
      noteId: string,
      name: NoteProperty["name"],
      type: NoteProperty["type"],
   ): void => {
      if (this.isDuplicateName(noteId, name)) {
         console.warn(
            `No se puede crear: la nota ${noteId} ya tiene una propiedad "${name}".`,
         );
         return;
      }

      // Generamos la nueva propiedad
      const newProperty = generateProperty(noteId, name, type);

      // Agregamos la nueva propiedad a la nota
      this.addPropertyToNote(noteId, newProperty);

      // Importante: si no hacemos lo de arriba primero, la nota no "existira" y fallara la vinculación
      // Comprobamos si existe propiedad global con ese nombre
      const existingGlobalProperty =
         globalPropertyController.getGlobalPropertyByName(name);

      if (existingGlobalProperty) {
         // Vinculamos a la propiedad global si existe
         globalPropertyController.linkToGlobalProperty(
            newProperty,
            existingGlobalProperty,
         );
      } else {
         // Creamos la propiedad global si no existe
         globalPropertyController.createGlobalProperty(name, type, newProperty);
      }
   };

   deletePropertyFromNote = (
      noteId: string,
      propertyToDeleteId: NoteProperty["id"],
   ) => {
      const propertyToDelete = this.getPropertyById(noteId, propertyToDeleteId);
      if (!propertyToDelete) return;

      const note = this.queryRepository.findById(noteId);
      if (!note) return;

      note.removeProperty(propertyToDeleteId);
      this.noteRepository.update(noteId, note);

      // Comprobamos si hay una propiedad global con ese nombre y la desvinculamos
      const existingGlobalProperty =
         globalPropertyController.getGlobalPropertyByName(
            propertyToDelete.name,
         );
      if (!existingGlobalProperty) return;

      globalPropertyController.unlinkFromGlobalProperty(propertyToDelete);
   };

   updatePropertyFromNote = (
      noteId: string,
      propertyId: NoteProperty["id"],
      updatedProperty: Partial<NoteProperty>,
   ): void => {
      const note = this.queryRepository.findById(noteId);
      if (!note) return;

      note.updateProperty(propertyId, updatedProperty);
      this.noteRepository.update(noteId, note);
   };

   getPropertyById = (
      noteId: string,
      propertyId: string,
   ): NoteProperty | undefined => {
      const note = this.queryRepository.findById(noteId);
      if (!note) return undefined;

      return note.properties.find(
         (property: NoteProperty) => property.id === propertyId,
      );
   };

   renameNotePropertyById(
      noteId: string,
      propertyId: NoteProperty["id"],
      newPropertyName: NoteProperty["name"],
   ) {
      const propertyToUpdate = this.getPropertyById(noteId, propertyId);
      if (!propertyToUpdate) return;

      propertyToUpdate.name = newPropertyName;
      this.updatePropertyFromNote(noteId, propertyId, propertyToUpdate);
   }

   handleNotePropertyRename(
      noteId: string,
      propertyId: NoteProperty["id"],
      newPropertyName: NoteProperty["name"],
   ) {
      if (this.isDuplicateName(noteId, newPropertyName, propertyId)) {
         console.warn(
            `No se puede renombrar: la nota ${noteId} ya tiene una propiedad "${newPropertyName}".`,
         );
         return;
      }

      // Buscamos que exista una propiedad por esos Ids y la renombramos
      const propertyToUpdate = this.getPropertyById(noteId, propertyId);
      if (!propertyToUpdate) return;

      this.renameNotePropertyById(noteId, propertyId, newPropertyName);

      // Comprobamos si existe propiedad global con el nuevo nombre
      const existingGlobalProperty =
         globalPropertyController.getGlobalPropertyByName(newPropertyName);

      if (existingGlobalProperty) {
         // Si existe propiedad global se vincula a la propiedad
         globalPropertyController.linkToGlobalProperty(
            propertyToUpdate,
            existingGlobalProperty,
         );
      } else {
         // Si no existe propiedad global, la creamos con nombre y tipo
         globalPropertyController.createGlobalProperty(
            newPropertyName,
            propertyToUpdate.type,
            propertyToUpdate,
         );
      }
   }

   changeNotePropertyType(
      noteId: string,
      propertyId: NoteProperty["id"],
      newPropertyType: NoteProperty["type"],
   ) {
      const property = this.getPropertyById(noteId, propertyId);
      if (!property) return;

      // Comprobamos si hay una propiedad global con ese nombre
      const existingGlobalProperty =
         globalPropertyController.getGlobalPropertyByName(property.name);
      if (!existingGlobalProperty) return;

      // Actualizamos la propiedad
      this.updatePropertyFromNote(noteId, propertyId, {
         type: newPropertyType,
      });

      // Cambiamos el tipo de la propiedad global
      globalPropertyController.updateGlobalPropertyType(
         existingGlobalProperty.id,
         newPropertyType,
      );
   }

   reorderNoteProperties = (
      noteId: string,
      propertyId: string,
      newPosition: number,
   ): void => {
      // Verificamos que la propiedad exista
      const note = this.queryRepository.findById(noteId);
      if (!note) return;

      const properties = [...note.properties];
      const currentIndex = properties.findIndex((p) => p.id === propertyId);

      // Validar que la nueva posición no sea negativa
      if (newPosition < 0) {
         throw new Error(
            `Invalid position: ${newPosition}. Must be greater than or equal to 0`,
         );
      }

      // Si la posición es mayor que la longitud, colocar al final
      if (newPosition >= properties.length) {
         newPosition = properties.length - 1;
      }

      // No hacer nada si la posición es la misma
      if (currentIndex === newPosition) {
         return;
      }

      // Extraer la propiedad que se va a mover
      const [propertyToMove] = properties.splice(currentIndex, 1);

      // Insertar la propiedad en la nueva posición
      properties.splice(newPosition, 0, propertyToMove);

      note.updateProperties(properties);
      this.noteRepository.update(noteId, note);
   };

   updateNotePropertyValue = (
      noteId: string,
      propertyId: string,
      newValue: NoteProperty["value"],
   ): void => {
      this.updatePropertyFromNote(noteId, propertyId, { value: newValue });
   };

   getNoteProperties = (noteId: string): NoteProperty[] => {
      const note = this.queryRepository.findById(noteId);
      return note ? note.properties : [];
   };
}

export const notePropertyController = $state(new NotePropertyController());

```

GlobalPropertyController

```
import type {
   GlobalProperty,
   NoteProperty,
} from "@projectTypes/core/propertyTypes";
import { generateGlobalProperty } from "@utils/propertyUtils";
import { normalizeText } from "@utils/searchUtils";
import { notePropertyController } from "@controllers/property/notePropertyController.svelte";
import { startupManager } from "@infrastructure/startup/startupManager.svelte";
import { GlobalPropertiesModel } from "@model/application/globalPropertiesModel.svelte";
import { Note } from "@domain/entities/Note";

class GlobalPropertyController {
   private get globalPropertiesModel(): GlobalPropertiesModel {
      return startupManager.getModel("globalPropertiesModel");
   }
   getGlobalPropertyById(id: GlobalProperty["id"]): GlobalProperty | undefined {
      return this.globalPropertiesModel.data.globalProperties.find(
         (globalProperty) => globalProperty.id === id,
      );
   }

   getGlobalPropertyByName(name: GlobalProperty["name"]) {
      return this.globalPropertiesModel.data.globalProperties.find(
         (globalProperty) => globalProperty.name === name,
      );
   }

   createGlobalProperty(
      name: GlobalProperty["name"],
      type: GlobalProperty["type"],
      noteProperty: NoteProperty,
   ) {
      // Generar y registrar la propiedad global
      const newGlobalProperty = generateGlobalProperty(name, type);
      this.globalPropertiesModel.createGlobalProperty(newGlobalProperty);

      // Vincular la propiedad de nota que crea la propiedad global a esta
      this.linkToGlobalProperty(noteProperty, newGlobalProperty);
   }

   private updateGlobalPropertyById(
      id: GlobalProperty["id"],
      updates: Partial<GlobalProperty>,
   ) {
      const globalProperty = this.getGlobalPropertyById(id);
      if (globalProperty !== undefined) return;
      this.globalPropertiesModel.updateGlobalPropertyById(
         id,
         (globalProperty) => ({
            ...globalProperty,
            ...updates,
         }),
      );
   }

   updateGlobalPropertyType(
      id: GlobalProperty["id"],
      type: GlobalProperty["type"],
   ) {
      this.updateGlobalPropertyById(id, { type: type });
   }

   renameGlobalProperty(
      id: GlobalProperty["id"],
      newPropertyName: GlobalProperty["name"],
   ) {
      // Buscamos y cambiamos el nombre a la propiedad global
      const globalProperty = this.getGlobalPropertyById(id);
      if (!globalProperty) return;
      // Comprobamos si ya existe
      const globalPropertyNameMatch =
         this.getGlobalPropertyByName(newPropertyName);
      if (!globalPropertyNameMatch) {
         this.updateGlobalPropertyById(id, { name: newPropertyName });
      } else {
         // metodo y dialogo para combinar propiedad a la que tiene el nuevo nombre
      }

      // Recorremos las note properties vinculadas a la propiedad global y actualizamos el nombre
      globalProperty.linkedProperties.forEach(({ noteId, propertyId }) => {
         notePropertyController.renameNotePropertyById(
            noteId,
            propertyId,
            newPropertyName,
         );
      });
   }

   deleteGlobalPropertyById(id: GlobalProperty["id"]) {
      const globalProperty = this.getGlobalPropertyById(id);
      if (!globalProperty) return;
      if (globalProperty.linkedProperties.length > 0) {
         console.warn("Cannot delete global property in use!");
      } else {
         this.globalPropertiesModel.deleteGlobalProperty(id);
      }
   }

   getGlobalProperties() {
      return this.globalPropertiesModel.data.globalProperties;
   }

   getGlobalPropertiesSuggestions(
      name: string,
      noteId?: Note["id"],
   ): GlobalProperty[] {
      // Preparar el término de búsqueda normalizado (si existe)
      const searchTerm = name?.trim() ? normalizeText(name) : "";

      // Recorremos las propiedades globales filtrandolas
      return this.globalPropertiesModel.data.globalProperties.filter(
         (property) => {
            if (
               noteId &&
               property.linkedProperties.some((link) => link.noteId === noteId)
            ) {
               // Si hay noteId y la nota ya contiene una propiedad enlazada a la propiedad global actual, no la sugerimos
               return false;
            }

            // Si no hay termino de busqueda sugerimos la propiedad global actual
            if (!searchTerm) return true;

            // Comprobamos si la propiedad global despues de preparar el nombre coincide con el termino de busqueda
            return normalizeText(property.name).includes(searchTerm);
         },
      );
   }

   linkToGlobalProperty(
      noteProperty: NoteProperty,
      globalProperty: GlobalProperty,
   ) {
      // 1) Desvincular a la propiedad global anterior
      this.unlinkFromGlobalProperty(noteProperty);

      // 2) Actualizar la global: añadir el enlace
      const newLink = {
         noteId: noteProperty.noteId,
         propertyId: noteProperty.id,
      };
      this.updateGlobalPropertyById(globalProperty.id, {
         linkedProperties: [...globalProperty.linkedProperties, newLink],
      });

      // 3) Actualizar la propiedad local (en la nota) para fijar globalPropertyId
      notePropertyController.updatePropertyFromNote(
         noteProperty.noteId,
         noteProperty.id,
         {
            globalPropertyId: globalProperty.id,
            name: globalProperty.name,
            // No actualizamos el tipo, mostraremos un aviso en la UI del missmatch
            // type: globalProperty.type,
         },
      );
   }

   /**
    * Usado al eliminar notas de propiedades
    *
    * @param deletedNoteProperty
    */
   unlinkFromGlobalProperty(deletedNoteProperty: NoteProperty) {
      const { globalPropertyId } = deletedNoteProperty;
      if (!globalPropertyId) return;
      const globalProperty = this.getGlobalPropertyById(globalPropertyId);
      if (!globalProperty) return;

      // Filtrar las noteProperties enlazadas con la global
      const filteredLinks = globalProperty.linkedProperties.filter(
         (link) =>
            !(
               link.noteId === deletedNoteProperty.noteId &&
               link.propertyId === deletedNoteProperty.id
            ),
      );
      this.updateGlobalPropertyById(globalPropertyId, {
         linkedProperties: filteredLinks,
      });

      // No eliminamos de la nota, ya que siempre tendran un globalPropertyId y esta función debe usarse solo al eliminar noteProperties o las propiedades se desincronizaran.
   }

   checkTypeMatch(noteProperty: NoteProperty): boolean {
      const { globalPropertyId } = noteProperty;

      if (!globalPropertyId) return false;

      let globalProperty = this.getGlobalPropertyById(globalPropertyId);
      if (!globalProperty) {
         console.warn(
            "No se ha encontrado ninguna propiedad global enlazada a esta propiedad",
         );
      } else if (noteProperty.type === globalProperty.type) {
         return true;
      }
      return false;
   }
}

export const globalPropertyController = $state(new GlobalPropertyController());
```

## Objetivo

Necesito migrar el sistema de propiedades siguiendo la misma arquitectura:

Paso 1: Entidades Ricas

Crear clase GlobalProperty con métodos (addLink(), removeLink(), updateType())
Crear clase NoteProperty
Mover validaciones y lógica básica a las entidades
Adaptar entidad Note para usar las nuevas clases creadas

Paso 2: Servicio de Dominio

Crear PropertyService para lógica de vinculación nota-global
Validaciones de tipo, nombres duplicados
Lógica de sincronización entre propiedades

Paso 3: Repositorios Query/Command
GlobalPropertyRepository: create, update, delete, save, findAll, findById, findByName
Herencia de PersistentLocalStorageModel (como el modelo anterior)
NoteProperty: Sin repositorio propio, se manejan via NoteRepository existente

Paso 4: Casos de Uso y Controladores
PropertyUseCases: Orquestar operaciones complejas usando PropertyService + repositorios
createPropertyWithLinking, renameWithCascade, deleteWithSync, validateIntegrity
Adelgazar controladores existentes:
NotePropertyController: delegar a PropertyUseCases, mantener estado reactivo $state()
GlobalPropertyController: delegar a PropertyUseCases, mantener estado reactivo $state()
Actualizar startupManager con nuevos repositorios y casos de uso

---

Realiza unicamente el paso 1
