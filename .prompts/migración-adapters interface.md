# Contexto y problema

Estoy refacorizando y arreglando partes cruciales de mi aplicación de notas local tipo Notion (Svelte 5 + Vite + Electron), es un proyecto individual mio por hobbie.

La estructura de repository + adapter actual usa un atributo "data" con $state() reactivo dentro de los adaptadores que guarda manualmente los datos desde metodos externos.

El problema de usar "data" es que tengo todo en memoria y los repository manipulan directamente esa variable "data". Pero no nos da ninguna interfaz comun con metodos y hace que los repositorios tengan que manipular la variable directamente sin ningún tipo de abstracción.

Esta bien para una aplicación pequeña pero no es algo escalable o extendible y esta muy poco pulido, tambien el tener tanta reactividad entrelazada causa problemas en mi aplicación.

# Objetivo y refactorización

La transición va a ser complicada porque este sistema tiene varios problemas que se entrelazan así que vamos a tratar de abordarlos poco a poco

Quiero hacer esta migración de arquitectura progresivamente, la tarea actual es modificar los 2 adaptadores:

Descripción detallada - Separar Repository de Adapter

### 2.1 **Crear Interfaz de Persistencia**

- Definir `PersistenceAdapter<T>` con métodos: `initialize()`, `getById()`, `getAll()`, `save()`, `update()`, `delete()`
- Métodos opcionales para batch: `saveMany()`, `deleteMany()`
- La interfaz NO debe tener referencias a `$state` ni `data`

### 2.2 **Refactorizar Adapters Existentes**

- `LocalStorageAdapter` y `JsonFileAdapter` implementan la interfaz
- Eliminar el atributo `data` público
- Adapters solo se encargan de leer/escribir, no de mantener estado
- Mantener métodos abstractos para serialización/deserialización

### 2.3 **Refactorizar Repositories**

- Repositories dejan de heredar de adapters
- Reciben adapter por constructor: `constructor(private adapter: PersistenceAdapter<T>)`
- Mover el `data = $state()` del adapter al repository (temporalmente)
- Repository es responsable del estado reactivo, adapter solo de persistencia

### 2.4 **Actualizar StartupManager**

- Crear adapters primero: `const noteAdapter = new LocalStorageAdapter('notes')`
- Pasar adapters a repositories: `new NoteRepository(noteAdapter)`
- Mantener el mismo flujo de inicialización

### 2.5 **Validar**

- La app debe funcionar exactamente igual
- Los datos siguen en memoria (por ahora)
- Pero ahora repository y adapter están desacoplados
- Preparado para cambiar adapters sin tocar repositories

# Arquitectura de la Aplicación

## 📁 Estructura de Carpetas

```
src/
├── application/
│   └── usecases/           # Casos de uso / Orquestadores
├── controllers/            # Controladores de UI (estado reactivo)
├── domain/
│   ├── entities/          # Entidades ricas con lógica de negocio
│   └── services/          # Servicios de dominio
├── infrastructure/
│   ├── persistence/       # Adaptadores de persistencia
│   └── repositories/      # Repositorios (acceso a datos)
└── directives/            # Directivas de Svelte
```

---

## 🎯 Responsabilidades por Capa

### **🎮 Controllers** (`src/controllers/`)

- **Qué hacen**: Manejan estado reactivo de UI y delegan operaciones
- **Responsabilidades**:
   - Estado reactivo con `$state()`
   - Feedback de UI (loading, error, success)
   - Delegación a UseCases
   - Validaciones simples para UI
- **NO hacen**: Lógica de negocio, persistencia
- **Ejemplo**: `notePropertyController.updateValue()` → `propertyUseCases.updateNotePropertyValue()`

### **⚙️ Services** (`src/domain/services/`)

- **Qué hacen**: Lógica de dominio compleja que involucra múltiples entidades
- **Responsabilidades**:
   - Algoritmos complejos
   - Coordinación entre entidades
   - Validaciones de negocio avanzadas
   - Lógica que no pertenece a una sola entidad
- **NO hacen**: Persistencia, estado de UI
- **Ejemplo**: `PropertyService.linkNotePropertyToGlobal()`, `SearchService.performHierarchicalSearch()`

### **🏛️ Entities** (`src/domain/entities/`)

- **Qué hacen**: Modelan conceptos de negocio con comportamiento
- **Responsabilidades**:
   - Lógica de negocio específica de la entidad
   - Validaciones propias
   - Transformaciones internas
   - Métodos de conveniencia
- **NO hacen**: Persistencia, conocer otras entidades
- **Ejemplo**: `Note.addProperty()`, `GlobalProperty.addLink()`, `NoteProperty.updateValue()`

### **🎭 UseCases** (`src/application/usecases/`)

- **Qué hacen**: Orquestan operaciones completas de la aplicación
- **Responsabilidades**:
   - Coordinar Services + Repositories
   - Transacciones complejas
   - Manejo de errores de aplicación
   - Operaciones que afectan múltiples agregados
- **NO hacen**: Estado de UI, lógica de negocio pura
- **Ejemplo**: `PropertyUseCases.createPropertyWithLinking()` → usa PropertyService + Repositories

### **🗄️ Repositories** (`src/infrastructure/repositories/`)

- **Qué hacen**: Abstracción de acceso a datos
- **Responsabilidades**:
   - CRUD de entidades
   - Consultas complejas
   - Conversión entity ↔ datos planos
   - Operaciones batch
- **NO hacen**: Lógica de negocio, transformaciones complejas
- **Ejemplo**: `GlobalPropertyRepository.findByName()`, `NoteRepository.updateMany()`

### **🔌 Adapters** (`src/infrastructure/persistence/`)

- **Qué hacen**: Implementaciones específicas de persistencia
- **Responsabilidades**:
   - Conexión con fuentes de datos específicas
   - Serialización/deserialización
   - Manejo de errores de infraestructura
   - Configuración de persistencia
- **NO hacen**: Conocer entidades, lógica de aplicación
- **Ejemplo**: `LocalStorageAdapter`, `JsonFileAdapter`, (futuro: `SQLiteAdapter`)

---

## 🔄 Flujo de Datos Típico

```
UI Event → Controller → UseCase → Service → Entity
                           ↓
                     Repository → Adapter → Storage
```

### **Ejemplo Concreto**: Crear propiedad de nota

1. **UI**: `onCreateProperty()`
2. **Controller**: `notePropertyController.handleCreateNoteProperty()`
3. **UseCase**: `propertyUseCases.createPropertyWithLinking()`
4. **Service**: `propertyService.createNoteProperty()`
5. **Entity**: `note.addProperty(property)` + `globalProperty.addLink()`
6. **Repository**: `noteRepository.update()` + `globalPropertyRepository.create()`
7. **Adapter**: `localStorageAdapter.save()`

---

## 📋 Cuándo Usar Cada Capa

### **✅ Migrar a Arquitectura Completa**

- Lógica de negocio compleja
- Múltiples entidades involucradas
- Necesita persistencia coordinada
- Operaciones transaccionales
- **Ejemplo**: Sistema de propiedades, búsqueda avanzada

### **✅ Solo Service + Controller**

- Lógica compleja sin persistencia
- Algoritmos específicos
- Transformaciones complejas
- **Ejemplo**: Búsqueda, validaciones complejas

### **✅ Solo Controller Simple**

- Estado de UI puro
- Delegación directa simple
- Sin lógica de negocio
- **Ejemplo**: Modal, tema, sidebar

---

## 🎯 Principios de Diseño

### **Separación de Responsabilidades**

- Cada capa tiene una responsabilidad clara
- No mezclar persistencia con lógica de negocio
- No mezclar estado de UI con algoritmos

### **Inversión de Dependencias**

- Controllers dependen de UseCases (no al revés)
- UseCases dependen de abstracciones (Repositories)
- Services son independientes

### **Testabilidad**

- Entities: Testing de lógica pura
- Services: Testing con mocks simples
- UseCases: Testing de orquestación
- Controllers: Testing de estado reactivo

### **Escalabilidad**

- Fácil cambiar de localStorage a SQLite
- Fácil agregar nuevos casos de uso
- Fácil reutilizar servicios en otros contextos

---

## 🚫 Anti-Patrones a Evitar

- ❌ Controllers con lógica de negocio
- ❌ Entities que se persisten solas (Active Record)
- ❌ Services que manejan estado de UI
- ❌ Repositories con lógica de negocio
- ❌ UseCases que acceden directamente a UI
- ❌ Adapters que conocen entidades

---

## 📚 Recursos y Convenciones

### **Naming Conventions**

- **Controllers**: `{Domain}Controller` (ej: `notePropertyController`)
- **Services**: `{Domain}Service` (ej: `PropertyService`, `SearchService`)
- **Entities**: `{Concept}` (ej: `Note`, `GlobalProperty`)
- **UseCases**: `{Domain}UseCases` (ej: `PropertyUseCases`)
- **Repositories**: `{Entity}Repository` (ej: `NoteRepository`)

### **File Organization**

- Un archivo por clase principal
- Interfaces junto a implementaciones
- Tipos específicos en archivos separados
- Tests junto a la implementación

### **Import Patterns**

```typescript
// ✅ Controllers importan UseCases
import { PropertyUseCases } from "@application/usecases/PropertyUseCases";

// ✅ UseCases importan Services + Repositories
import { PropertyService } from "@domain/services/PropertyService";
import { NoteRepository } from "@infrastructure/repositories/NoteRepository";

// ✅ Services importan Entities
import { Note } from "@domain/entities/Note";
```

# Código:

LocalStorageAdapter.svelte.ts

```
export abstract class LocalStorageAdapter<T> {
   data: T = $state() as T;
   public isInitialized = $state(false);

   constructor(private storageKey: string) {}

   public initialize() {
      this.initializeData();
   }

   private initializeData() {
      this.load();
      this.isInitialized = true;
   }

   // Método abstracto que deben implementar las clases hijas
   protected abstract getDefaultData(): T;

   // Métodos opcionales para serialización/deserialización personalizada
   protected serializeData(data: T): any {
      return $state.snapshot(data);
   }

   protected deserializeData(data: any): T {
      return { ...this.getDefaultData(), ...data };
   }

   /**
    * Guarda los datos manualmente en localStorage
    * @returns true si el guardado fue exitoso, false en caso contrario
    */
   public save(): boolean {
      try {
         const serializableData = this.serializeData(this.data);
         localStorage.setItem(
            this.storageKey,
            JSON.stringify(serializableData),
         );
         return true;
      } catch (error) {
         console.warn(
            `Error saving ${this.storageKey} to localStorage:`,
            error,
         );
         return false;
      }
   }

   protected load(): void {
      try {
         const storedData = localStorage.getItem(this.storageKey);
         if (storedData) {
            const parsedData = JSON.parse(storedData);
            this.data = this.deserializeData(parsedData);
         }
      } catch (error) {
         console.warn(
            `Error loading ${this.storageKey} from localStorage:`,
            error,
         );
         this.data = this.getDefaultData();
      }
   }

   // Método público para resetear a valores por defecto
   public resetToDefaults(): void {
      this.data = this.getDefaultData();
   }

   /**
    * Recarga los datos desde localStorage
    */
   public reload(): void {
      this.load();
   }
}

```

JsonFileAdapter.svelte.ts

```
export abstract class JsonFileAdapter<T> {
   data: T = $state() as T;
   public isInitialized = $state(false);

   constructor(private filename: string) {}

   public initialize() {
      this.initializeData();
   }

   private initializeData() {
      this.load();
      this.isInitialized = true;
   }

   // Método abstracto que deben implementar las clases hijas
   protected abstract getDefaultData(): T;

   // Métodos opcionales para serialización/deserialización personalizada
   protected serializeData(data: T): any {
      return $state.snapshot(data);
   }

   protected deserializeData(data: any): T {
      return { ...this.getDefaultData(), ...data };
   }

   /**
    * Guarda los datos manualmente en archivo JSON
    * @returns true si el guardado fue exitoso, false en caso contrario
    */
   public save(): boolean {
      try {
         const serializableData = this.serializeData(this.data);
         const result = window.electronAPI.fs.writeJson(this.filename, serializableData);

         if (!result.success) {
            console.error(`Error al guardar ${this.filename}:`, result.error);
            return false;
         }

         console.log(`Guardado archivo ${this.filename}`);
         return true;
      } catch (error) {
         console.error(`Error al guardar ${this.filename}:`, error);
         return false;
      }
   }

   protected load(): void {
      try {
         const result = window.electronAPI.fs.readJson(this.filename);

         if (result.success && result.data) {
            // Combinar datos cargados con valores por defecto para manejar nuevas propiedades
            this.data = this.deserializeData(result.data);
            console.log(`Datos cargados para ${this.filename}:`, this.data);
         } else if (result.error !== "FILE_NOT_FOUND") {
            console.error(`Error al cargar ${this.filename}:`, result.error);
            this.data = this.getDefaultData();
         } else {
            console.warn(`Archivo ${this.filename} no encontrado, usando defaults`);
            this.data = this.getDefaultData();
         }
      } catch (error) {
         console.error(`Error al cargar ${this.filename}:`, error);
         this.data = this.getDefaultData();
      }
   }

   /**
    * Recarga los datos desde el archivo
    */
   public reload(): void {
      this.load();
   }

   /**
    * Método público para resetear a valores por defecto
    */
   public resetToDefaults(): void {
      this.data = this.getDefaultData();
   }

   /**
    * Verifica si el archivo existe
    */
   public fileExists(): boolean {
      return window.electronAPI.fs.fileExists(this.filename);
   }
}
```

NoteRepository.ts

```
import { Note } from "@domain/entities/Note";
import { LocalStorageAdapter } from "@infrastructure/persistence/LocalStorageAdapter.svelte";

interface NoteData {
   notes: any[]; // Objetos planos para persistencia
}

/**
 * Repositorio para comandos (operaciones que modifican estado)
 */
export class NoteRepository extends LocalStorageAdapter<NoteData> {
   constructor() {
      super("notes");
   }

   protected getDefaultData(): NoteData {
      return { notes: [] };
   }

   protected deserializeData(data: any): NoteData {
      if (!data.notes || !Array.isArray(data.notes)) {
         return { notes: [] };
      }
      return data;
   }

   /**
    * Crea una nueva nota
    */
   create(note: Note): void {
      this.data.notes.push(note.toPlainObject());
   }

   /**
    * Actualiza una nota existente
    */
   update(noteId: string, updatedNote: Note): void {
      const index = this.data.notes.findIndex((n) => n.id === noteId);
      if (index !== -1) {
         this.data.notes[index] = updatedNote.toPlainObject();
      }
   }

   /**
    * Elimina una nota
    */
   delete(noteId: string): void {
      this.data.notes = this.data.notes.filter((n) => n.id !== noteId);
   }

   /**
    * Elimina múltiples notas
    */
   deleteMany(noteIds: Set<string>): void {
      this.data.notes = this.data.notes.filter((n) => !noteIds.has(n.id));
   }

   /**
    * Actualiza múltiples notas en una operación
    */
   updateMany(updates: Map<string, Note>): void {
      this.data.notes = this.data.notes.map((noteData) => {
         const updatedNote = updates.get(noteData.id);
         return updatedNote ? updatedNote.toPlainObject() : noteData;
      });
   }

   /**
    * Reemplaza todo el conjunto de notas
    */
   replaceAll(notes: Note[]): void {
      this.data.notes = notes.map((note) => note.toPlainObject());
   }

   /**
    * Ejecuta una operación batch con múltiples cambios
    */
   batch(operations: () => void): void {
      // Envuelve las operaciones para que se ejecuten juntas
      // La implementación real de persistencia se encargará del guardado
      operations();
   }

   /**
    * Obtiene todos los objetos planos (para el QueryRepository)
    */
   getAllPlainObjects(): any[] {
      return this.data.notes;
   }
}

```

NoteQueryRepository

```
import { Note } from "@domain/entities/Note";
import { NoteRepository } from "./NoteRepository";
import { normalizeText } from "@utils/searchUtils";

/**
 * Repositorio para queries (operaciones de solo lectura)
 */
export class NoteQueryRepository {
   constructor(private noteRepository: NoteRepository) {}

   /**
    * Obtiene todas las notas como entidades ricas
    */
   findAll(): Note[] {
      return this.noteRepository
         .getAllPlainObjects()
         .map((data) => Note.fromPlainObject(data));
   }

   /**
    * Busca una nota por ID
    */
   findById(noteId: string): Note | undefined {
      const noteData = this.noteRepository
         .getAllPlainObjects()
         .find((n) => n.id === noteId);

      return noteData ? Note.fromPlainObject(noteData) : undefined;
   }

   /**
    * Busca múltiples notas por IDs
    */
   findByIds(noteIds: string[]): Note[] {
      const idSet = new Set(noteIds);
      return this.noteRepository
         .getAllPlainObjects()
         .filter((n) => idSet.has(n.id))
         .map((data) => Note.fromPlainObject(data));
   }

   /**
    * Encuentra notas por título (búsqueda parcial)
    */
   findByTitle(title: string): Note[] {
      const normalizedSearch = normalizeText(title);
      return this.findAll().filter((note) =>
         normalizeText(note.title).includes(normalizedSearch),
      );
   }

   /**
    * Encuentra notas por padre
    */
   findByParent(parentId: string | undefined): Note[] {
      return this.findAll().filter((note) => note.parentId === parentId);
   }

   /**
    * Encuentra las notas raíz
    */
   findRootNotes(): Note[] {
      return this.findAll().filter((note) => !note.parentId);
   }

   /**
    * Verifica si existe una nota
    */
   exists(noteId: string): boolean {
      return this.noteRepository
         .getAllPlainObjects()
         .some((n) => n.id === noteId);
   }

   /**
    * Verifica si un título ya existe en un contexto dado
    */
   titleExists(title: string, parentId?: string, excludeId?: string): boolean {
      const normalizedTitle = normalizeText(title);
      return this.findAll().some(
         (note) =>
            note.id !== excludeId &&
            note.parentId === parentId &&
            normalizeText(note.title) === normalizedTitle,
      );
   }

   /**
    * Cuenta el total de notas
    */
   count(): number {
      return this.noteRepository.getAllPlainObjects().length;
   }

   /**
    * Busca notas que contengan un texto en el contenido
    */
   searchByContent(searchText: string): Note[] {
      const normalizedSearch = normalizeText(searchText);
      return this.findAll().filter((note) =>
         normalizeText(note.content).includes(normalizedSearch),
      );
   }

   /**
    * Busca notas por propiedad
    */
   findByProperty(propertyName: string, propertyValue?: any): Note[] {
      return this.findAll().filter((note) =>
         note.properties.some((prop) => {
            const nameMatches = prop.name === propertyName;
            const valueMatches =
               propertyValue === undefined || prop.value === propertyValue;
            return nameMatches && valueMatches;
         }),
      );
   }

   /**
    * Obtiene notas con estadísticas
    */
   findWithStats(): Note[] {
      return this.findAll().filter((note) => note.stats !== undefined);
   }

   /**
    * Busca notas modificadas después de una fecha
    */
   findModifiedAfter(date: Date): Note[] {
      return this.findAll().filter(
         (note) => note.metadata.modified.toJSDate() > date,
      );
   }

   /**
    * Obtiene notas favoritas (si se pasa una lista de IDs)
    */
   findFavorites(favoriteIds: Set<string>): Note[] {
      return this.findAll().filter((note) => favoriteIds.has(note.id));
   }

   /**
    * Valida si un conjunto de IDs existe
    */
   validateIds(noteIds: string[]): { valid: string[]; invalid: string[] } {
      const existingIds = new Set(
         this.noteRepository.getAllPlainObjects().map((n) => n.id),
      );

      const valid: string[] = [];
      const invalid: string[] = [];

      noteIds.forEach((id) => {
         if (existingIds.has(id)) {
            valid.push(id);
         } else {
            invalid.push(id);
         }
      });

      return { valid, invalid };
   }
}

```

SidebarRepository.ts

```
import { LocalStorageAdapter } from "@infrastructure/persistence/LocalStorageAdapter.svelte";

interface SidebarState {
   isOpen: boolean;
   width: number | undefined;
}

export class SidebarRepository extends LocalStorageAdapter<SidebarState> {
   constructor() {
      super("Sidebar");
   }

   protected getDefaultData(): SidebarState {
      return {
         isOpen: true,
         width: undefined,
      };
   }

   get width() {
      return this.data.width;
   }
   set width(newValue: SidebarState["width"]) {
      this.data.width = newValue;
   }
   get isOpen() {
      return this.data.isOpen;
   }
   set isOpen(newValue: SidebarState["isOpen"]) {
      this.data.isOpen = newValue;
   }
}

```

NoteUseCases.ts

```
import { Note } from "@domain/entities/Note";
import { NotePathService } from "@domain/services/NotePathService";
import { NoteTreeService } from "@domain/services/NoteTreeService";
import { NoteRepository } from "@infrastructure/repositories/core/NoteRepository";
import { NoteQueryRepository } from "@infrastructure/repositories/core/NoteQueryRepository";
import { FavoritesUseCases } from "@application/usecases/FavoritesUseCases";
import { generateUniqueTitle } from "@utils/noteUtils";

/**
 * Casos de uso para operaciones complejas con notas
 */
export class NoteUseCases {
   private pathService: NotePathService;
   private treeService: NoteTreeService;
   private favoritesUseCases?: FavoritesUseCases;

   constructor(
      private noteRepository: NoteRepository,
      private queryRepository: NoteQueryRepository,
      favoritesUseCases?: FavoritesUseCases,
   ) {
      this.pathService = new NotePathService();
      this.treeService = new NoteTreeService();
      this.favoritesUseCases = favoritesUseCases;
   }

   /**
    * Crea una nota con validaciones y actualización del padre
    */
   createNote(params: {
      parentId?: string;
      title?: string;
      content?: string;
      icon?: string;
   }): string | null {
      // Validar padre si existe
      if (params.parentId && !this.queryRepository.exists(params.parentId)) {
         console.error(`Parent note ${params.parentId} not found`);
         return null;
      }

      // Generar título único
      const allNotes = this.queryRepository.findAll();
      const finalTitle = generateUniqueTitle(allNotes, params.title);

      // Crear nota
      const newNote = Note.create({
         title: finalTitle,
         parentId: params.parentId,
         content: params.content,
         icon: params.icon,
      });

      // Persistir
      this.noteRepository.create(newNote);

      // Actualizar padre si existe
      if (params.parentId) {
         const parent = this.queryRepository.findById(params.parentId);
         if (parent) {
            parent.addChild(newNote.id);
            this.noteRepository.update(parent.id, parent);
         }
      }

      return newNote.id;
   }

   /**
    * Crea notas desde un path jerárquico
    */
   createNoteFromPath(path: string): string | null {
      const segments = this.pathService.parseNotePath(path);
      if (!segments.length) return null;

      const allNotes = this.queryRepository.findAll();
      const resolution = this.pathService.resolveNotePath(segments, allNotes);

      // Si no hay segmentos faltantes, retornar la última nota existente
      if (!resolution.missingSegments.length) {
         const lastNote =
            resolution.existingNotes[resolution.existingNotes.length - 1];
         return lastNote?.id || null;
      }

      // Crear notas faltantes
      let currentParentId = resolution.lastParentId;
      let lastCreatedId: string | null = null;

      for (const segment of resolution.missingSegments) {
         const noteId = this.createNote({
            parentId: currentParentId,
            title: segment,
         });

         if (!noteId) {
            console.error(`Failed to create note: ${segment}`);
            break;
         }

         lastCreatedId = noteId;
         currentParentId = noteId;
      }

      return lastCreatedId;
   }

   /**
    * Elimina una nota y todos sus descendientes
    */
   deleteNote(noteId: string): void {
      const note = this.queryRepository.findById(noteId);
      if (!note) return;

      const allNotes = this.queryRepository.findAll();

      // Obtener todos los IDs a eliminar
      const descendants = this.treeService.getDescendants(noteId, allNotes);
      const idsToDelete = new Set([noteId, ...descendants.map((n) => n.id)]);

      // Eliminar de padres
      if (note.parentId) {
         const parent = this.queryRepository.findById(note.parentId);
         if (parent) {
            parent.removeChild(noteId);
            this.noteRepository.update(parent.id, parent);
         }
      }

      // Eliminar notas
      this.noteRepository.deleteMany(idsToDelete);

      // Limpiar favoritos
      if (this.favoritesUseCases) {
         this.favoritesUseCases.handleNotesDeleted(idsToDelete);
      }
   }

   /**
    * Mueve una nota a una nueva posición
    */
   moveNote(
      noteId: string,
      newParentId: string | undefined,
      position: number,
   ): void {
      const note = this.queryRepository.findById(noteId);
      if (!note) return;

      const allNotes = this.queryRepository.findAll();

      // Validar movimiento
      if (newParentId) {
         const validation = this.treeService.canMoveNote(
            noteId,
            newParentId,
            allNotes,
         );
         if (!validation.valid) {
            throw new Error(validation.reason);
         }
      }

      // Remover del padre anterior
      if (note.parentId) {
         const oldParent = this.queryRepository.findById(note.parentId);
         if (oldParent) {
            oldParent.removeChild(noteId);
            this.noteRepository.update(oldParent.id, oldParent);
         }
      }

      // Actualizar parentId
      note.changeParent(newParentId);

      // Generar título único si es necesario
      const siblings = this.queryRepository.findByParent(newParentId);
      const uniqueTitle = this.treeService.ensureUniqueSiblingTitle(
         note.title,
         newParentId,
         allNotes,
         noteId,
      );

      if (uniqueTitle !== note.title) {
         note.updateTitle(uniqueTitle);
      }

      // Insertar en nueva posición
      if (newParentId) {
         const newParent = this.queryRepository.findById(newParentId);
         if (newParent) {
            newParent.insertChildAt(noteId, position);
            this.noteRepository.update(newParent.id, newParent);
         }
      } else {
         // Mover a raíz - reordenar el array completo
         this.reorderRootNotes(noteId, position);
      }

      // Guardar nota actualizada
      this.noteRepository.update(noteId, note);
   }

   /**
    * Reordena las notas raíz
    */
   private reorderRootNotes(noteId: string, position: number): void {
      const allNotes = this.queryRepository.findAll();
      const rootNotes = this.treeService.getRootNotes(allNotes);
      const otherNotes = allNotes.filter((n) => n.parentId);

      // Filtrar la nota movida
      const filteredRoots = rootNotes.filter((n) => n.id !== noteId);
      const movedNote = allNotes.find((n) => n.id === noteId);

      if (!movedNote) return;

      // Calcular posición ajustada
      const originalIndex = rootNotes.findIndex((n) => n.id === noteId);
      const adjustedPosition = this.treeService.calculateAdjustedPosition(
         originalIndex,
         position,
         filteredRoots.length,
      );

      // Crear nuevo orden
      const newRootOrder = [
         ...filteredRoots.slice(0, adjustedPosition),
         movedNote,
         ...filteredRoots.slice(adjustedPosition),
      ];

      // Actualizar repositorio con nuevo orden
      this.noteRepository.replaceAll([...newRootOrder, ...otherNotes]);
   }

   /**
    * Actualiza el contenido y estadísticas de una nota
    */
   updateNoteContent(noteId: string, content: string, stats?: any): void {
      const note = this.queryRepository.findById(noteId);
      if (!note) return;

      if (stats) {
         note.updateContentWithStats(content, stats);
      } else {
         note.updateContent(content);
      }

      this.noteRepository.update(noteId, note);
   }

   /**
    * Batch operation para actualizar múltiples notas
    */
   batchUpdate(updates: Map<string, (note: Note) => void>): void {
      this.noteRepository.batch(() => {
         updates.forEach((updater, noteId) => {
            const note = this.queryRepository.findById(noteId);
            if (note) {
               updater(note);
               this.noteRepository.update(noteId, note);
            }
         });
      });
   }
}

```

StartupManager.svelte.ts

```
// Nueva arquitectura
import { NoteRepository } from "@infrastructure/repositories/core/NoteRepository";
import { NoteQueryRepository } from "@infrastructure/repositories/core/NoteQueryRepository";
import { FavoritesRepository } from "@infrastructure/repositories/core/FavoritesRepository";
import { GlobalPropertyRepository } from "@infrastructure/repositories/core/GlobalPropertyRepository";
import { SidebarRepository } from "@infrastructure/repositories/ui/SidebarRepository";
import { SettingsRepository } from "@infrastructure/repositories/core/SettingsRepository";
import { CollapsibleRepository } from "@infrastructure/repositories/core/CollapsibleRepository";
import { WorkspaceRepository } from "@infrastructure/repositories/ui/WorkspaceRepository";

import { NoteTreeService } from "@domain/services/NoteTreeService";
import { NotePathService } from "@domain/services/NotePathService";
import { PropertyService } from "@domain/services/PropertyService";
import { SearchService } from "@domain/services/SearchService";

import { PropertyUseCases } from "@application/usecases/PropertyUseCases";
import { NoteUseCases } from "@application/usecases/NoteUseCases";
import { FavoritesUseCases } from "@application/usecases/FavoritesUseCases";
import { WorkspaceService } from "@domain/services/WorkspaceService";

// Tipos para los servicios
interface Services {
   settingsRepository: SettingsRepository;
   noteRepository: NoteRepository;
   globalPropertyRepository: GlobalPropertyRepository;
   noteQueryRepository: NoteQueryRepository;
   favoritesRepository: FavoritesRepository;
   sidebarRepository: SidebarRepository;
   collapsibleRepository: CollapsibleRepository;
   workspaceRepository: WorkspaceRepository;
   workspaceService: WorkspaceService;
   noteUseCases: NoteUseCases;
   searchService: SearchService;
   favoritesUseCases: FavoritesUseCases;
   noteTreeService: NoteTreeService;
   notePathService: NotePathService;
   propertyService: PropertyService;
   propertyUseCases: PropertyUseCases;
}

interface StartupStep {
   name: string;
   initialize: () => Promise<void>;
}

class StartupManager {
   public isReady = $state(false);
   public currentStep = $state<string>("");
   public progress = $state(0);
   public error = $state<string | null>(null);
   public services = {} as Services;

   private async setupSteps() {
      const steps: StartupStep[] = [
         {
            name: "Inicializando configuración...",
            initialize: async () => {
               this.services.settingsRepository = new SettingsRepository();
               await this.services.settingsRepository.initialize();
            },
         },
         {
            name: "Inicializando repositorios de favoritos...",
            initialize: async () => {
               this.services.favoritesRepository = new FavoritesRepository();
               await this.services.favoritesRepository.initialize();
            },
         },
         {
            name: "Inicializando repositorios de notas...",
            initialize: async () => {
               // Repositorios
               this.services.noteRepository = new NoteRepository();
               await this.services.noteRepository.initialize();

               this.services.noteQueryRepository = new NoteQueryRepository(
                  this.services.noteRepository,
               );
            },
         },
         {
            name: "Inicializando repositorios de propiedades...",
            initialize: async () => {
               this.services.globalPropertyRepository =
                  new GlobalPropertyRepository();
               await this.services.globalPropertyRepository.initialize();
            },
         },
         {
            name: "Inicializando repositorios de la UI...",
            initialize: async () => {
               // Sidebar
               this.services.sidebarRepository = new SidebarRepository();
               await this.services.sidebarRepository.initialize();
               // Collapsible
               this.services.collapsibleRepository =
                  new CollapsibleRepository();
               await this.services.collapsibleRepository.initialize();
               // Workspace
               this.services.workspaceRepository = new WorkspaceRepository();
               await this.services.workspaceRepository.initialize();
            },
         },
         {
            name: "Inicializando servicios de dominio...",
            initialize: async () => {
               this.services.noteTreeService = new NoteTreeService();
               this.services.notePathService = new NotePathService();
               this.services.propertyService = new PropertyService();
               this.services.searchService = new SearchService();
               this.services.workspaceService = new WorkspaceService();
            },
         },
         {
            name: "Inicializando casos de uso...",
            initialize: async () => {
               // Casos de uso de favoritos
               this.services.favoritesUseCases = new FavoritesUseCases(
                  this.services.favoritesRepository,
               );

               // Casos de uso de notas
               this.services.noteUseCases = new NoteUseCases(
                  this.services.noteRepository,
                  this.services.noteQueryRepository,
                  this.services.favoritesUseCases,
               );

               // Casos de uso de propiedades
               this.services.propertyUseCases = new PropertyUseCases(
                  this.services.propertyService,
                  this.services.globalPropertyRepository,
                  this.services.noteRepository,
                  this.services.noteQueryRepository,
               );
            },
         },
         {
            name: "Validando integridad del sistema...",
            initialize: async () => {
               // Validar integridad de propiedades al inicio
               try {
                  const integrityResult =
                     await this.services.propertyUseCases.validateIntegrity(
                        true,
                     );
                  if (!integrityResult.isValid) {
                     console.warn(
                        "Problemas de integridad detectados y reparados:",
                        integrityResult.issues,
                     );
                  }
               } catch (error) {
                  console.warn(
                     "Error durante validación de integridad:",
                     error,
                  );
                  // No fallar el inicio por problemas de integridad
               }
            },
         },
      ];
      return steps;
   }

   public async launchApp(): Promise<void> {
      if (this.isReady) return;

      this.error = null;
      this.progress = 0;

      try {
         const steps = await this.setupSteps();

         for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            this.currentStep = step.name;

            await step.initialize();
            this.progress = ((i + 1) / steps.length) * 100;

            // Pequeña pausa para mostrar el progreso
            await new Promise((resolve) => setTimeout(resolve, 100));
         }

         this.currentStep = "Aplicación lista";
         this.isReady = true;
         console.log(
            "✅ APLICACIÓN LISTA - Sistema de propiedades migrado exitosamente",
         );
      } catch (error) {
         console.error("❌ Error durante el inicio de la aplicación:", error);
         this.error = `Error durante la inicialización: ${error}`;
         this.isReady = false;
      }
   }

   // Método para resetear y reinicializar
   public async restart(): Promise<void> {
      this.isReady = false;
      this.currentStep = "";
      this.progress = 0;
      this.error = null;
      this.services = {} as Services;

      await this.launchApp();
   }

   // Método tipado para obtener servicios
   public getService<K extends keyof Services>(serviceName: K): Services[K] {
      if (!this.isReady) {
         throw new Error(
            `StartupManager no está listo. Servicio ${serviceName} no disponible.`,
         );
      }

      if (!this.services[serviceName]) {
         throw new Error(`Servicio "${serviceName}" no encontrado.`);
      }

      return this.services[serviceName];
   }
}

export const startupManager = new StartupManager();
```
