# Referencia de Arquitectura: Electron + Svelte 5 + SQLite

## Filosofía

Esta arquitectura prioriza el máximo valor con la mínima fricción para aplicaciones 100% locales.

El enfoque híbrido combina el patrón Repository para una separación clara entre lógica de negocio y persistencia, entidades ricas que contienen lógica de dominio, estado reactivo centralizado con runes de Svelte 5, comunicación IPC tipada entre procesos, e integración con API síncrona mediante better-sqlite3.

---

## Estructura del Proyecto

```
src/
├── main/                           # Proceso principal de Electron
│   ├── database/                  # Configuración y setup de SQLite
│   ├── entities/                  # Entidades ricas (lógica de negocio)
│   ├── repositories/              # Capa de acceso a datos (consultas SQL)
│   ├── utils/                     # Helpers y lógica compleja pura
│   └── ipc-handlers/              # API de comunicación entre procesos
├── renderer/                       # Proceso renderer de Electron (UI)
│   ├── components/                # Componentes de Svelte
│   ├── controllers/               # Coordinación de UI (sin estado)
│   ├── services/                  # Adaptadores IPC y validaciones de UI
│   ├── stores/                    # Estado reactivo global
│   └── utils/                     # Helpers de UI
└── shared/
    ├── types/                     # Tipos compartidos de TypeScript
    └── contracts/                 # Contratos e interfaces IPC
```

---

## Flujo de Datos

Los datos fluyen a través del sistema siguiendo este patrón:

```
UI → Controller → Service → IPC → Handler → Repository → SQLite
     ↓                               ↓
   Store                          Entity + Utils
```

### Ejemplo Conceptual: Crear una Nota

El proceso comienza cuando la UI dispara una acción mediante `onclick={() => noteController.createNote(title, content)}`. El Controller coordina la llamada al service y actualiza el store correspondientemente. El Service valida la entrada de UI y realiza la llamada IPC. La capa IPC invoca `ipc.invoke('notes:create', request)` para comunicarse con el proceso principal. El Handler orquesta las interacciones entre repository, entity y utils. La Entity aplica la lógica de negocio mientras el Repository maneja la persistencia en SQLite. Finalmente, el Store se actualiza de forma reactiva para reflejar los cambios en la UI.

---

## Responsabilidades por Capa

### Entities (Proceso Principal)

Las entidades contienen lógica de negocio rica sin preocupaciones de persistencia.

```typescript
export class Note {
   constructor(
      public id: string,
      public title: string,
      public content: string,
      public parentId?: string,
      public children: string[] = [],
   ) {}

   // Implementación de lógica de negocio
   updateTitle(newTitle: string): void {
      // Lógica de validación y transformación
      this.title = sanitizeTitle(newTitle);
      this.updateModified();
   }

   addChild(childId: string): void {
      // Lógica de estructura de árbol
      if (!this.children.includes(childId)) {
         this.children.push(childId);
         this.updateModified();
      }
   }

   // Métodos factory
   static create(params: { title: string; parentId?: string }): Note {
      return new Note(generateId(), params.title, "", params.parentId);
   }

   // Métodos de serialización
   toPlainObject(): any {
      /* conversión a objeto plano */
   }
   static fromPlainObject(data: any): Note {
      /* desde objeto plano */
   }
}
```

Las entidades son responsables de la lógica de negocio específica de la entidad, validaciones de dominio, transformaciones internas, métodos factory, y serialización/deserialización. No manejan persistencia, operaciones SQL, ni interacciones con otras entidades.

### Repositories (Proceso Principal)

Los repositories manejan exclusivamente el acceso a datos.

```typescript
export class NoteRepository {
   findById(id: string): Note | null {
      const stmt = db.prepare("SELECT * FROM notes WHERE id = ?");
      const row = stmt.get(id);
      return row ? Note.fromPlainObject(row) : null;
   }

   save(note: Note): Note {
      const data = note.toPlainObject();
      const stmt = db.prepare(`
      INSERT OR REPLACE INTO notes (id, title, content, parent_id)
      VALUES (?, ?, ?, ?)
    `);
      stmt.run(data.id, data.title, data.content, data.parentId);
      return note;
   }

   // Consultas específicas
   findByParentId(parentId: string): Note[] {
      /* implementación de consulta SQL */
   }
   findRootNotes(): Note[] {
      /* implementación de consulta SQL */
   }
}
```

Los repositories son responsables de operaciones CRUD en entidades, consultas complejas, conversión de entidad a datos, y transacciones SQL. No contienen lógica de negocio ni validaciones de dominio.

### Utils (Proceso Principal)

Los utils contienen lógica compleja pura implementada como funciones estáticas.

```typescript
export class NoteTreeUtils {
   static wouldCreateCycle(
      noteId: string,
      newParentId: string,
      allNotes: Note[],
   ): boolean {
      // Algoritmo para detectar ciclos en estructura de árbol
   }

   static canMoveNote(
      noteId: string,
      newParentId: string,
      allNotes: Note[],
   ): ValidationResult {
      // Lógica compleja de validación de movimiento
   }

   static getDescendants(noteId: string, allNotes: Note[]): Note[] {
      // Algoritmo recursivo para encontrar descendientes
   }
}
```

Los utils son responsables de algoritmos complejos, lógica que involucra múltiples entidades, validaciones avanzadas, y funciones puras reutilizables. No manejan persistencia, gestión de estado, ni efectos secundarios.

### IPC Handlers (Proceso Principal)

Los IPC Handlers sirven como API entre procesos y orquestan las interacciones entre Repository, Utils y Entity.

```typescript
export function setupNoteHandlers() {
   ipcMain.handle("notes:create", (_, request: CreateNoteRequest) => {
      // Entity crea, Repository persiste
      const note = Note.create(request);
      return noteRepository.save(note);
   });

   ipcMain.handle("notes:moveNote", (_, { noteId, newParentId }) => {
      const allNotes = noteRepository.findAll();

      // Utils validan lógica compleja
      const validation = NoteTreeUtils.canMoveNote(
         noteId,
         newParentId,
         allNotes,
      );
      if (!validation.valid) throw new Error(validation.reason);

      // Entity modifica, Repository persiste
      const note = noteRepository.findById(noteId);
      note.updateParent(newParentId);
      return noteRepository.save(note);
   });
}
```

Los IPC Handlers coordinan las interacciones entre Repository, Utils y Entity, validan lógica de negocio compleja, manejan errores del proceso principal, y exponen API tipada al proceso renderer. No gestionan lógica de UI ni estado reactivo.

### Controllers (Proceso Renderer)

Los controllers manejan la coordinación de UI sin mantener estado.

```typescript
export class NoteController {
   async createNote(title: string, content: string) {
      // Actualizar estado de carga
      noteStore.setLoading(true);

      try {
         // Delegar al service
         const note = await noteService.createNote(title, content);

         // Actualizar stores
         noteStore.addNote(note);
         uiStore.showSuccess("Note created");
      } catch (error) {
         uiStore.showError("Failed to create note");
      } finally {
         noteStore.setLoading(false);
      }
   }

   async loadAllNotes() {
      const notes = await noteService.getAllNotes();
      noteStore.setNotes(notes); // Controller puebla los stores
   }
}
```

Los controllers coordinan las interacciones entre Service y Store, gestionan estados de carga y error, orquestan operaciones complejas de UI, y pueblan stores con datos. No mantienen estado reactivo, implementan lógica de negocio, ni realizan llamadas IPC directas.

### Services (Proceso Renderer)

Los services actúan como adaptadores IPC con validaciones simples de UI.

```typescript
export class NoteService {
   async createNote(title: string, content: string): Promise<Note> {
      // Validaciones simples de UI
      if (!title.trim()) throw new Error("Title required");
      if (title.length > 200) throw new Error("Title too long");

      // Delegar al proceso principal
      return ipc.invoke("notes:create", { title: title.trim(), content });
   }

   // Helpers de UI
   formatPreview(note: Note): string {
      /* formateo para visualización en UI */
   }
   searchNotes(notes: Note[], query: string): Note[] {
      /* búsqueda del lado cliente */
   }
}
```

Los services proporcionan adaptadores IPC tipados, validaciones rápidas de UI, formateo y transformación para UI, y helpers específicos del renderer. No gestionan estado reactivo ni implementan lógica de negocio.

### Stores (Proceso Renderer)

Los stores gestionan el estado reactivo global.

```typescript
class NoteStore {
   private _notes = $state<Note[]>([]);
   private _loading = $state(false);
   private _currentNote = $state<Note | null>(null);

   // Getters reactivos
   get notes() {
      return this._notes;
   }
   get loading() {
      return this._loading;
   }
   get currentNote() {
      return this._currentNote;
   }

   // Métodos de actualización de estado
   setNotes(notes: Note[]) {
      this._notes = notes;
   }
   addNote(note: Note) {
      this._notes = [note, ...this._notes];
   }
   setLoading(loading: boolean) {
      this._loading = loading;
   }
   selectNote(note: Note) {
      this._currentNote = note;
   }
}
```

Los stores implementan estado reactivo con runes de Svelte 5, proporcionan getters para consumo en UI, ofrecen métodos de actualización de estado, y mantienen el estado global de la aplicación. No contienen lógica de negocio ni realizan llamadas externas.

### Componentes UI (Proceso Renderer)

Los componentes UI manejan la interfaz de usuario y delegan acciones a los controllers.

```svelte
<script lang="ts">
import { noteController } from "@/controllers/NoteController";
import { noteStore } from "@/stores/noteStore.svelte";

// Valores reactivos derivados con runes
const notes = $derived(noteStore.notes);
const loading = $derived(noteStore.loading);

// Acciones via controller
function handleCreate() {
   noteController.createNote(title, content);
}
</script>

<!-- UI se comunica únicamente con Controller -->
<button onclick={handleCreate}>Create Note</button>
{#if loading}Loading...{/if}
{#each notes as note}...{/each}
```

Los componentes UI proporcionan la interfaz de usuario, leen estado directamente desde stores, delegan acciones a controllers, y gestionan estado local del componente. No implementan lógica de negocio ni realizan llamadas directas a services.

---

## Patrones Arquitectónicos y Decisiones

### Patrón Repository vs Active Record

La arquitectura utiliza el patrón Repository en lugar de Active Record. Esta decisión soporta entidades ricas sin preocupaciones SQL mezcladas, facilita testing fácil de lógica de negocio, mantiene separación clara de responsabilidades, y organiza consultas complejas de manera efectiva.

### Gestión de Estado Reactivo

La UI lee stores directamente siguiendo patrones estándar de Svelte. Los controllers coordinan y pueblan stores mientras los componentes mantienen estado local cuando es apropiado.

### Estrategia de Persistencia Híbrida

El sistema utiliza SQLite para datos primarios como Notes y Properties, archivos JSON para configuración y settings mediante patrones Repository y JSONFileAdapter, y localStorage para estado simple de UI como el estado de colapso del sidebar.

### Comunicación IPC

Toda la comunicación IPC está completamente tipada usando contratos compartidos. Los handlers coordinan las interacciones entre Repository, Utils y Entity mientras los services actúan como adaptadores en el proceso renderer.

---

## Beneficios de la Arquitectura

### Reducción de Fricción en el Desarrollo

La arquitectura requiere 4-5 archivos por feature comparado con 6-8 en implementaciones previas. Proporciona un flujo directo y predecible con la API síncrona de SQLite.

### Separación Clara de Responsabilidades

La lógica de negocio reside en Entities, la persistencia es manejada por Repositories, la gestión de estado ocurre en Stores, y la coordinación de UI sucede a través de Controllers.

### Mantenibilidad y Testabilidad

Las entities soportan testing de lógica pura, los utils permiten testing de algoritmos complejos, los repositories facilitan testing con SQLite en memoria, y los controllers permiten testing de coordinación con mocks.

### Escalabilidad

La arquitectura facilita agregar nuevas entidades, mantiene patrones consistentes a través de features, permite reutilización de utils, y soporta estrategias de migración gradual.

---

## Convenciones

### Convenciones de Nomenclatura

Los controllers siguen el patrón `{Domain}Controller` como `NoteController`. Los services utilizan `{Domain}Service` como `NoteService`. Las entities se nombran por concepto como `Note` o `GlobalProperty`. Los repositories siguen `{Entity}Repository` como `NoteRepository`. Los utils utilizan `{Domain}Utils` como `NoteTreeUtils`. Los stores siguen `{domain}Store` como `noteStore` o `uiStore`.

### Patrones de Importación

Los controllers importan Services y Stores. Los services importan contratos IPC. Los handlers importan Repository, Utils y Entities.

```typescript
// Controllers importan Services + Stores
import { noteService } from "@/services/NoteService";
import { noteStore } from "@/stores/noteStore.svelte";

// Services importan contratos IPC
import { ipc } from "@/lib/ipc";

// Handlers importan Repository + Utils + Entities
import { NoteRepository } from "@/repositories/NoteRepository";
import { NoteTreeUtils } from "@/utils/NoteTreeUtils";
import { Note } from "@/entities/Note";
```

---

## Casos de Uso Comunes

### Features Simples (CRUD Básico)

Los features simples siguen el camino: UI → Controller → Service → IPC → Handler → Repository.

### Features Complejos (Con Validaciones y Algoritmos)

Los features complejos utilizan: UI → Controller → Service → IPC → Handler → Utils + Repository + Entity.

### Estado Simple de UI (Sidebar, Modals)

La gestión de estado simple de UI utiliza: UI → Store Local + localStorage.

### Configuración (Settings de Usuario)

La gestión de configuración sigue: UI → Controller → Service → IPC → Handler → SettingsRepository + JSONFileAdapter.
