# Contexto de la Aplicación

## Información General

- **Aplicación**: Tipo Notion local (árbol de notas jerárquico)
- **Tecnologías**: Svelte 5, Vite, Electron
- **Desarrollo**: En solitario
- **Persistencia**: localStorage / JSON Files

## Tipos Principales

### Notas

```typescript
export interface Note {
   id: string;
   icon?: string;
   title: string;
   content: string;
   children: string[];
   parentId?: string;
   stats?: NoteStats;
   metadata: NoteMetadata;
   properties: NoteProperty[];
}

export interface NoteMetadata {
   created: DateTime;
   modified: DateTime;
   outgoingLinks: NoteReference[];
   incomingLinks: NoteReference[];
   aliases: string[];
}
```

### Propiedades

```typescript
export type NoteProperty =
   | TextProperty
   | ListProperty
   | NumberProperty
   | CheckProperty
   | DateProperty
   | DateTimeProperty;

export interface GlobalProperty {
   id: string;
   name: string;
   type: NoteProperty["type"];
   linkedProperties: { noteId: Note["id"]; propertyId: NoteProperty["id"] }[];
   suggestedValues?: string[];
}
```

### Estado Global

```typescript
let notes: Note[];
let globalProperties: GlobalProperty[];
let favorites: NoteReference[];
```

## Funcionalidades Clave

- **Estructura jerárquica**: Notas padre-hijo con children array
- **Propiedades dinámicas**: Sistema de propiedades tipadas vinculadas a propiedades globales
- **Creación por paths**: "proyecto/backend/auth" crea estructura automática
- **Operaciones de árbol**: Movimiento, reordenamiento, validación de ciclos
- **Metadatos**: Fechas, enlaces, estadísticas de contenido

## Patrón Actual

- **Modelos**: Clases que extienden PersistentLocalStorageModel/PersistentJsonFileModel
- **Controladores**: Coordinan UI y contienen lógica de negocio
- **Vistas**: Componentes Svelte 5

## Arquitectura Objetivo para Notas

### Estructura

```
src/
├── domain/
│   ├── Note.ts                    # Entidad rica con lógica de negocio
│   ├── NotePathService.ts         # Lógica de creación por paths
│   └── NoteTreeService.ts         # Lógica de movimiento y árbol
├── application/
│   └── NoteUseCases.ts            # Operaciones complejas multi-entidad
├── infrastructure/
│   ├── NoteRepository.ts          # Commands (create, update, delete)
│   └── NoteQueryRepository.ts     # Queries (get, find, search)
└── controllers/
    ├── NoteController.ts          # Coordinación UI operaciones
    └── NoteQueryController.ts     # Coordinación UI consultas
```

### Principios

- **Entidades ricas**: Lógica de negocio en las entidades (Note.updateTitle(), Note.canMoveTo())
- **Servicios simples**: Solo para lógica que no pertenece a una entidad específica
- **Separación Command/Query**: Escritura vs lectura en repositorios
- **Casos de uso**: Para operaciones complejas que involucran múltiples entidades
- **Controladores delgados**: Solo coordinan UI y delegan a casos de uso

## Consideraciones Técnicas

- **Serialización**: DateTime de Luxon requiere deserialización especial
- **IDs únicos**: crypto.randomUUID() para entidades
- **Validaciones**: Títulos únicos por nivel jerárquico
- **Performance**: Batch operations para operaciones múltiples
