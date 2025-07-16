# Design Document

## Overview

Esta refactorización transformará la arquitectura actual de Senda-Notes de un patrón con modelo anémico a una arquitectura MVC robusta donde los modelos contengan lógica de negocio y los controladores actúen como coordinadores.

### Problemas Identificados en la Arquitectura Actual

1. **Modelo Anémico**: `NoteModel` es básicamente un wrapper de persistencia sin lógica de negocio
2. **Controladores Sobrecargados**: `NoteController` contiene lógica de negocio, validación y manipulación directa de datos
3. **Separación Confusa**: Existe `NoteEntity` con lógica de negocio pero no se usa en el flujo principal
4. **Responsabilidades Mezcladas**: Los controladores manejan tanto coordinación como lógica de dominio

### Arquitectura Objetivo

- **Entities**: Objetos de dominio ricos con lógica de negocio y validación
- **Repositories**: Abstracción de persistencia que separa el dominio del almacenamiento
- **Services**: Orquestadores de casos de uso complejos que coordinan entities y repositories
- **Controllers**: Coordinadores ligeros que manejan eventos de UI y delegan a services
- **Value Objects**: Objetos inmutables para conceptos auxiliares con validación

## Architecture

### Capas de la Nueva Arquitectura

```
┌─────────────────────────────────────────┐
│                View Layer               │
│           (Svelte Components)           │
└─────────────────┬───────────────────────┘
                  │ UI Events
┌─────────────────▼───────────────────────┐
│            Controller Layer             │
│          (UI Coordination)              │
└─────────────────┬───────────────────────┘
                  │ Use Cases
┌─────────────────▼───────────────────────┐
│             Service Layer               │
│        (Business Orchestration)        │
└─────────────────┬───────────────────────┘
                  │ Domain Operations
┌─────────────────▼───────────────────────┐
│             Domain Layer                │
│    (Entities + Value Objects)           │
└─────────────────┬───────────────────────┘
                  │ Persistence
┌─────────────────▼───────────────────────┐
│           Repository Layer              │
│        (Storage Abstraction)            │
└─────────────────────────────────────────┘
```

### Flujo de Datos

1. **Vista → Controlador**: Eventos de usuario (clicks, inputs)
2. **Controlador → Service**: Casos de uso de negocio
3. **Service → Entity**: Operaciones de dominio y validación
4. **Service → Repository**: Persistencia de cambios
5. **Service → Vista**: Notificaciones reactivas (Svelte $state)

## Components and Interfaces

### 1. Domain Layer - Note Entity

La entidad Note encapsula toda la lógica de negocio:

```typescript
class NoteEntity {
   private constructor(
      public readonly id: NoteId,
      private _title: NoteTitle,
      private _content: string,
      private _metadata: NoteMetadata,
      private _properties: NoteProperty[],
      private _children: NoteId[] = [],
      private _parentId?: NoteId,
      private _icon?: string,
      private _stats?: NoteStats,
   ) {}

   // Factory Methods
   static create(params: CreateNoteParams): Result<NoteEntity, NoteError>;
   static fromDTO(dto: NoteDTO): Result<NoteEntity, NoteError>;

   // Business Operations
   updateTitle(newTitle: string): Result<void, InvalidNoteTitleError>;
   updateContent(content: string): void;
   addChild(childId: NoteId): Result<void, CircularReferenceError>;
   removeChild(childId: NoteId): void;
   updateIcon(icon?: string): void;

   // Queries
   get title(): string;
   get content(): string;
   get children(): readonly NoteId[];
   get parentId(): NoteId | undefined;
   hasChildren(): boolean;
   isChildOf(parentId: NoteId): boolean;

   // Export
   toDTO(): NoteDTO;
}
```

### 2. Value Objects

Objetos inmutables para conceptos del dominio:

```typescript
class NoteId {
   private constructor(private readonly value: string) {}

   static create(value?: string): NoteId;
   static generate(): NoteId;

   toString(): string;
   equals(other: NoteId): boolean;
}

class NoteTitle {
   private constructor(private readonly value: string) {}

   static create(title: string): Result<NoteTitle, InvalidNoteTitleError>;

   toString(): string;
   isEmpty(): boolean;
   private static validate(title: string): boolean;
   private static sanitize(title: string): string;
}

class NotePath {
   private constructor(private readonly segments: string[]) {}

   static fromString(path: string): Result<NotePath, InvalidPathError>;
   static fromNoteHierarchy(notes: NoteEntity[], targetId: NoteId): NotePath;

   toString(): string;
   getSegments(): readonly string[];
   getDepth(): number;
}
```

### 3. Repository Layer

Abstracción de persistencia:

```typescript
interface INoteRepository {
   findById(id: NoteId): Promise<NoteEntity | null>;
   findByParent(parentId: NoteId): Promise<NoteEntity[]>;
   findAll(): Promise<NoteEntity[]>;
   save(note: NoteEntity): Promise<void>;
   saveMany(notes: NoteEntity[]): Promise<void>;
   delete(id: NoteId): Promise<void>;
   deleteMany(ids: NoteId[]): Promise<void>;
   exists(id: NoteId): Promise<boolean>;
}

class LocalStorageNoteRepository implements INoteRepository {
   private readonly storageKey = "notes";

   async findById(id: NoteId): Promise<NoteEntity | null>;
   async findAll(): Promise<NoteEntity[]>;
   async save(note: NoteEntity): Promise<void>;
   // ... implementación específica de localStorage
}
```

### 4. Service Layer

Orquestadores de casos de uso:

```typescript
interface INoteService {
   createNote(params: CreateNoteParams): Promise<Result<NoteEntity, NoteError>>;
   updateNote(
      id: NoteId,
      updates: UpdateNoteParams,
   ): Promise<Result<NoteEntity, NoteError>>;
   deleteNote(id: NoteId): Promise<Result<void, NoteError>>;
   deleteNoteWithDescendants(id: NoteId): Promise<Result<void, NoteError>>;
   moveNote(
      noteId: NoteId,
      newParentId?: NoteId,
   ): Promise<Result<void, NoteError>>;
   createNoteFromPath(path: string): Promise<Result<NoteEntity, NoteError>>;
   generateUniqueTitle(baseTitle: string, parentId?: NoteId): Promise<string>;
}

class NoteService implements INoteService {
   constructor(
      private repository: INoteRepository,
      private eventBus: EventBus,
   ) {}

   async createNote(
      params: CreateNoteParams,
   ): Promise<Result<NoteEntity, NoteError>> {
      // 1. Validate parameters
      // 2. Generate unique title if needed
      // 3. Create Note entity
      // 4. Validate business rules (parent exists, no circular refs)
      // 5. Save to repository
      // 6. Update parent's children
      // 7. Emit domain events
   }

   async deleteNoteWithDescendants(
      id: NoteId,
   ): Promise<Result<void, NoteError>> {
      // 1. Find note and all descendants
      // 2. Validate deletion rules
      // 3. Remove from parent's children
      // 4. Delete all notes in batch
      // 5. Emit domain events
   }
}
```

### 5. Controller Layer

Coordinadores ligeros de UI:

```typescript
interface INoteController {
   handleCreateNote(parentId?: string): Promise<void>;
   handleUpdateNote(id: string, field: string, value: any): Promise<void>;
   handleDeleteNote(id: string): Promise<void>;
   handleMoveNote(noteId: string, newParentId?: string): Promise<void>;
   handleCreateFromPath(path: string): Promise<void>;
}

class NoteController implements INoteController {
   constructor(
      private noteService: INoteService,
      private workspaceController: WorkspaceController,
      private notificationController: NotificationController,
      private focusController: FocusController,
   ) {}

   async handleCreateNote(parentId?: string): Promise<void> {
      const result = await this.noteService.createNote({
         parentId: parentId ? NoteId.create(parentId) : undefined,
      });

      if (result.success) {
         this.workspaceController.openNote(result.data.id.toString());
         this.focusController.requestFocus(FocusTarget.TITLE);
      } else {
         this.notificationController.showError(result.error.message);
      }
   }
}
```

## Data Models

### Domain Events

```typescript
interface DomainEvent {
   readonly eventId: string;
   readonly occurredAt: DateTime;
   readonly aggregateId: string;
}

interface NoteCreatedEvent extends DomainEvent {
   readonly type: "NoteCreated";
   readonly noteId: NoteId;
   readonly parentId?: NoteId;
   readonly title: string;
}

interface NoteUpdatedEvent extends DomainEvent {
   readonly type: "NoteUpdated";
   readonly noteId: NoteId;
   readonly changes: Partial<NoteDTO>;
}

interface NoteDeletedEvent extends DomainEvent {
   readonly type: "NoteDeleted";
   readonly noteId: NoteId;
   readonly parentId?: NoteId;
   readonly descendantIds: NoteId[];
}
```

### DTOs and Parameters

```typescript
interface NoteDTO {
   id: string;
   title: string;
   content: string;
   children: string[];
   parentId?: string;
   icon?: string;
   metadata: {
      created: string; // ISO string
      modified: string; // ISO string
      outgoingLinks: { noteId: string; title: string; icon?: string }[];
      incomingLinks: { noteId: string; title: string; icon?: string }[];
      aliases: string[];
   };
   properties: NotePropertyDTO[];
   stats?: {
      wordCount: number;
      characterCount: number;
      lineCount: number;
      lastCalculated: string; // ISO string
   };
}

interface CreateNoteParams {
   title?: string;
   content?: string;
   parentId?: NoteId;
   icon?: string;
   properties?: NoteProperty[];
}

interface UpdateNoteParams {
   title?: string;
   content?: string;
   icon?: string;
   properties?: NoteProperty[];
}
```

### Event Bus

```typescript
interface EventBus {
   publish<T extends DomainEvent>(event: T): void;
   subscribe<T extends DomainEvent>(
      eventType: string,
      handler: (event: T) => void,
   ): () => void; // returns unsubscribe function
}

class InMemoryEventBus implements EventBus {
   private handlers = new Map<string, Array<(event: DomainEvent) => void>>();

   publish<T extends DomainEvent>(event: T): void {
      const eventHandlers = this.handlers.get(event.type) || [];
      eventHandlers.forEach((handler) => handler(event));
   }

   subscribe<T extends DomainEvent>(
      eventType: string,
      handler: (event: T) => void,
   ): () => void {
      if (!this.handlers.has(eventType)) {
         this.handlers.set(eventType, []);
      }
      this.handlers.get(eventType)!.push(handler as any);

      return () => {
         const handlers = this.handlers.get(eventType) || [];
         const index = handlers.indexOf(handler as any);
         if (index > -1) handlers.splice(index, 1);
      };
   }
}
```

## Error Handling

### Error Types

```typescript
abstract class NoteError extends Error {
   abstract readonly code: string;
}

class NoteNotFoundError extends NoteError {
   readonly code = "NOTE_NOT_FOUND";
}

class InvalidNoteTitleError extends NoteError {
   readonly code = "INVALID_TITLE";
}

class CircularReferenceError extends NoteError {
   readonly code = "CIRCULAR_REFERENCE";
}
```

### Error Handling Strategy

1. **Model Layer**: Retorna `Result<T, Error>` para operaciones que pueden fallar
2. **Controller Layer**: Maneja errores y actualiza UI apropiadamente
3. **View Layer**: Muestra mensajes de error al usuario

### Result Pattern

```typescript
type Result<T, E = Error> =
   | { success: true; data: T }
   | { success: false; error: E };

// Usage
const result = noteModel.createNote(params);
if (result.success) {
   // Handle success
   controller.openNoteInEditor(result.data.id);
} else {
   // Handle error
   notificationController.showError(result.error.message);
}
```

## Testing Strategy

### Unit Testing

1. **Note Entity Tests**
   - Validation logic
   - Business rules
   - State transitions

2. **Note Model Tests**
   - CRUD operations
   - Business logic
   - Event emission
   - Error scenarios

3. **Controller Tests**
   - Event handling
   - Coordination logic
   - Error handling

### Integration Testing

1. **Model-Repository Integration**
   - Persistence operations
   - Data consistency

2. **Controller-Model Integration**
   - End-to-end workflows
   - Event propagation

### Test Structure

```typescript
describe("NoteModel", () => {
   describe("createNote", () => {
      it("should create note with valid parameters");
      it("should generate unique title when title exists");
      it("should validate parent exists");
      it("should emit NoteCreatedEvent");
      it("should return error for invalid parameters");
   });

   describe("updateNote", () => {
      it("should update existing note");
      it("should validate title uniqueness");
      it("should emit NoteUpdatedEvent");
      it("should return error for non-existent note");
   });
});
```

## Migration Strategy

### Phase 1: Create Rich Note Entity

- Implement new `Note` class with business logic
- Add validation and business rules
- Create comprehensive tests

### Phase 2: Implement Rich Note Model

- Create new `NoteModel` with business operations
- Implement event system
- Add error handling with Result pattern

### Phase 3: Refactor Controllers

- Simplify `NoteController` to coordination only
- Remove business logic from controllers
- Update event handlers

### Phase 4: Update Persistence Layer

- Abstract repository pattern
- Separate persistence from business logic
- Maintain backward compatibility

### Phase 5: Integration and Testing

- Connect all layers
- Comprehensive testing
- Performance validation

## Implementation Notes

### Svelte Integration

- Use Svelte stores for reactive state management
- Maintain current component structure
- Preserve existing UI behavior

### Backward Compatibility

- Maintain existing public APIs during transition
- Gradual migration of components
- No breaking changes to UI

### Performance Considerations

- Lazy loading of note relationships
- Efficient event propagation
- Optimized persistence operations
- Batch updates for multiple note operations
- Memoization of expensive computations (note paths, hierarchies)

### Svelte $state Integration

```typescript
// Service layer exposes reactive state
class NoteService {
   private _notes = $state<Map<string, NoteEntity>>(new Map());
   private _activeNoteId = $state<string | null>(null);

   get notes(): ReadonlyMap<string, NoteEntity> {
      return this._notes;
   }

   get activeNote(): NoteEntity | null {
      return this._activeNoteId
         ? this._notes.get(this._activeNoteId) || null
         : null;
   }

   // Business methods update reactive state
   async createNote(
      params: CreateNoteParams,
   ): Promise<Result<NoteEntity, NoteError>> {
      const result = await this.createNoteEntity(params);
      if (result.success) {
         this._notes.set(result.data.id.toString(), result.data);
         this.eventBus.publish(new NoteCreatedEvent(result.data));
      }
      return result;
   }
}
```

### Migration Compatibility

Durante la migración, mantendremos compatibilidad con:

- Estructura actual de archivos JSON en localStorage
- APIs públicas existentes de controladores
- Componentes Svelte existentes
- Formato de datos de propiedades y metadatos

La migración será transparente para el usuario final.
