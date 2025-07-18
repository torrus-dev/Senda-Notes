# Migración de arquitectura - Sistema de Propiedades

## Contexto

Estoy migrando una aplicación tipo Notion local (Svelte + Electron) de una arquitectura con controladores gordos + modelos anémicos hacia una arquitectura ligera inspirada en DDD.

La aplicación es un proyecto hobbie, no es algo profesional y es individual, por eso prefiero la simpleza a la complejidad.

Ya he migrado exitosamente el sistema de Notas con esta estructura (tambien te incluyo la ubicación de los controladores relacionados con propiedades)

```
📁src
   └── 📁application
       └── 📁usecases
           └── NoteUseCases.ts
   └── 📁controllers
       └── 📁notes
           ├── noteController.svelte.ts
           ├── noteQueryController.svelte.ts
       └── 📁property
           ├── globalPropertyController.svelte.ts
           └── notePropertyController.svelte.ts
       └── // demas controladores...
   └── 📁directives
       ├── floatingMenuDirective.svelte.ts
       ├── onClickOutside.ts
       └── onPressEsc.ts
   └── 📁domain
       └── 📁entities
           ├── Note.ts
       └── 📁services
           ├── NotePathService.ts
           └── NoteTreeService.ts
 └── 📁infrastructure
     └── 📁persistence
         ├── JsonFileAdapter.svelte.ts
         └── LocalStorageAdapter.svelte.ts
     └── 📁repositories
         ├── FavoritesRepository.ts
         ├── NoteQueryRepository.ts
         └── NoteRepository.ts
```

## Funcionamiento de las propiedades
Para las propiedades es un sistema muy similar al de Obsidian.

Las notas contienen propiedades dentro, al crear una propiedad que no existe en otra nota, esta se registra en las propiedades globales.

Si renombramos una nota dentro de una propiedad se desvincula de la propiedad global y se crea una propiedad global nueva o se vincula a una existente si ya existe ese nombre.

Al cambiar el tipo si que afecta a la propiedad global donde se guarda el tipo que deberia ser.

Si el valor de una propiedad de nota no coincide con el tipo de la propiedad global se muestra un aviso, tambien en el futuro deberia servir para sugerir datos al usuario, por ejemplo una property list autores te sugerira los que ya has usado en otras notas

## Entidad Note relevante

```typescript
export class Note {
   // ... otros campos
   properties: NoteProperty[];

   updateProperties(properties: NoteProperty[]): void {
      this.properties = properties;
      this.updateModified();
   }

   addProperty(property: NoteProperty): void {
      this.properties.push(property);
      this.updateModified();
   }

   removeProperty(propertyId: string): void {
      const index = this.properties.findIndex((p) => p.id === propertyId);
      if (index !== -1) {
         this.properties.splice(index, 1);
         this.updateModified();
      }
   }

   updateProperty(propertyId: string, updates: Partial<NoteProperty>): void {
      const property = this.properties.find((p) => p.id === propertyId);
      if (property) {
         Object.assign(property, updates);
         this.updateModified();
      }
   }
}
```

## Tipos actuales de propiedades

```typescript
interface BaseProperty {
   id: string;
   noteId: Note["id"];
   globalPropertyId?: GlobalProperty["id"];
   name: string;
}

// definición de tipos de propiedad...

export type NoteProperty =
   | TextProperty // { type: "text"; value: string }
   | ListProperty // { type: "list"; value: string[] }
   | NumberProperty // { type: "number"; value: number }
   | CheckProperty // { type: "check"; value: boolean }
   | DateProperty // { type: "date"; value: Date }
   | DateTimeProperty; // { type: "datetime"; value: DateTime }

export interface GlobalProperty {
   id: string;
   name: string;
   type: NoteProperty["type"];
   linkedProperties: { noteId: Note["id"]; propertyId: NoteProperty["id"] }[];
   createdAt: DateTime;
   updatedAt: DateTime;
   suggestedValues?: string[];
}
```

## Controladores actuales a migrar

NotePropertyController
```
import type { NoteProperty } from "@projectTypes/core/propertyTypes";
import type { Note } from "@domain/entities/Note";
import { globalPropertyController } from "@controllers/property/globalPropertyController.svelte";
import { startupManager } from "@model/startup/startupManager.svelte";
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
import { startupManager } from "@model/startup/startupManager.svelte";
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
Crear clase base para Property si es necesario
Mover validaciones y lógica básica a las entidades

Paso 2: Servicio de Dominio

Crear PropertyService para lógica de vinculación nota-global
Validaciones de tipo, nombres duplicados
Lógica de sincronización entre propiedades

Paso 3: Repositorios Query/Command

GlobalPropertyRepository: create, update, delete
GlobalPropertyQueryRepository: find, search, getSuggestions
Herencia de PersistentLocalStorageModel

Paso 4: Casos de Uso y Controladores

PropertyUseCases: crear con vinculación, renombrar en cascada, cambiar tipo
Adelgazar NotePropertyController y GlobalPropertyController
Mantener estado reactivo con $state() para Svelte 5
Actualizar startupManager con nuevos servicios

---

En tu respuesta realiza el paso 1 unicamente
