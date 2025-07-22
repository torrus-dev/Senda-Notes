Quiero terminar de migrar la parte de workspace (que se encarga de las pestañas de la aplicación)

Esta ya todo incluido en el startupManager

Lo he estado transformando en un controller + repository.

Habia pensado en añadir WorkspaceService porque es simple pero hay partes que tienen cierta complejidad.

Código:
workspaceController.svelte.ts
```
import type { Tab } from "@projectTypes/ui/uiTypes";

import { startupManager } from "@infrastructure/startup/startupManager.svelte";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";
import { createNoteReference } from "@utils/noteUtils";
import { settingsController } from "@controllers/application/settingsController.svelte";
import { Note } from "@domain/entities/Note";
import { WorkspaceRepository } from "@infrastructure/repositories/ui/WorkspaceRepository";

class WorkspaceController {
   private get workspaceRepository(): WorkspaceRepository {
      return startupManager.getService("workspaceRepository");
   }

   private settingsAplied = false;
   constructor() {
      $effect.root(() => {
         $effect(() => {
            if (!this.settingsAplied && settingsController.isReady) {
               if (settingsController.get("keepTabs") === false) {
                  this.closeAllTabs();
               }
               this.settingsAplied = true;
            }
         });
      });
   }

   getTabByTabId(tabId: Tab["id"]): Tab | undefined {
      return this.workspaceRepository.getTabByTabId(tabId);
   }
   getTabByNoteId(noteId: Note["id"]): Tab | undefined {
      return this.workspaceRepository.getTabByNoteId(noteId);
   }
   getActiveTab() {
      return this.workspaceRepository.getActiveTab();
   }

   isNoteOpenInTab(noteId: Note["id"]): boolean {
      return this.findTabIndexByNoteId(noteId) !== -1;
   }

   findTabIndexByTabId(tabId: string): number {
      return this.workspaceRepository.tabs.findIndex(
         (tab: Tab) => tab.id === tabId,
      );
   }
   findTabIndexByNoteId(noteId: Note["id"]): number {
      return this.workspaceRepository.tabs.findIndex(
         (tab: Tab) => tab.noteReference?.noteId === noteId,
      );
   }

   // metodo para cuando hacemos click normal sobre una nota para abrirla, el lo gestiona todo.
   openNote(noteId: Note["id"]) {
      const activeTabId = this.workspaceRepository.activeTabId;
      if (activeTabId) {
         if (this.isNoteOpenInTab(noteId)) {
            this.activateTabByNoteId(noteId);
         } else {
            this.switchActiveTabNote(noteId);
         }
      } else {
         this.openNoteInNewTab(noteId);
      }
   }
   // poner tab que contiene la nota como principal
   activateTabByNoteId(noteId: Note["id"]) {
      const tab = this.getTabByNoteId(noteId);
      if (!tab) return;
      this.workspaceRepository.activeTabId = tab.id;
   }
   activateTabByTabId(tabId: Tab["id"]) {
      const tab = this.getTabByTabId(tabId);
      if (!tab) return;
      this.workspaceRepository.activeTabId = tab.id;
   }

   // cambiar la nota de la tab activa
   switchActiveTabNote(noteId: Note["id"]) {
      if (!this.workspaceRepository.activeTabId) return;
      this.switchTabNote(noteId, this.workspaceRepository.activeTabId);
   }

   unsetActiveTabNoteReference() {
      const { activeTabId } = this.workspaceRepository;
      if (!activeTabId) return;
      const tabIndex = this.findTabIndexByTabId(activeTabId);
      if (tabIndex === -1) return;

      this.workspaceRepository.tabs[tabIndex].noteReference = undefined;
   }
   private switchTabNote(noteId: Note["id"], tabId: string) {
      const note = noteQueryController.getNoteById(noteId);
      const tabIndex = this.findTabIndexByTabId(tabId);
      if (!note || tabIndex === -1) return;
      const newReference = createNoteReference(note);
      this.workspaceRepository.tabs[tabIndex].noteReference = newReference;
   }

   addTabAndSetActive(newTab: Tab) {
      this.workspaceRepository.tabs.push(newTab);
      this.workspaceRepository.activeTabId = newTab.id;
   }

   newEmptyTab() {
      const newTab = {
         id: crypto.randomUUID(),
         noteReference: undefined,
      };
      this.addTabAndSetActive(newTab);
   }

   // crear una nueva tab con una referencia
   openNoteInNewTab(noteId: Note["id"]) {
      const note = noteQueryController.getNoteById(noteId);
      if (!note) return;
      if (!this.isNoteOpenInTab(noteId)) {
         const newTab = {
            id: crypto.randomUUID(),
            noteReference: createNoteReference(note),
         };
         this.addTabAndSetActive(newTab);
      } else {
         this.activateTabByNoteId(noteId);
      }
   }

   closeTabByTabId(tabId: Tab["id"]) {
      const tabIndex = this.findTabIndexByTabId(tabId);
      if (tabIndex === -1) return;

      this.workspaceRepository.tabs.splice(tabIndex, 1);

      if (this.workspaceRepository.activeTabId === tabId) {
         if (this.workspaceRepository.tabs.length === 0) {
            // No quedan pestañas
            this.workspaceRepository.activeTabId = undefined;
         } else {
            // Activar la pestaña anterior o la primera disponible
            const newActiveTabIndex = Math.max(0, tabIndex - 1);
            this.workspaceRepository.activeTabId =
               this.workspaceRepository.tabs[newActiveTabIndex].id;
         }
      }
   }
   closeTabByNoteId(noteId: Note["id"]) {
      const tabIndex = this.findTabIndexByNoteId(noteId);
      if (tabIndex === -1) return;

      const tabId = this.workspaceRepository.tabs[tabIndex].id;
      this.closeTabByTabId(tabId);
   }

   // Cerrar todas las pestañas
   closeAllTabs() {
      this.workspaceRepository.tabs = [];
      this.workspaceRepository.activeTabId = undefined;
   }

   // Cerrar todas las pestañas excepto la activa
   closeOtherTabs(tabId: Tab["id"]) {
      const tab = this.getTabByTabId(tabId);
      if (tab) {
         this.workspaceRepository.tabs = [tab];
      }
   }

   // Mover una pestaña a una nueva posición
   moveTab(fromIndex: number, toIndex: number) {
      const tabs = this.workspaceRepository.tabs;
      if (
         fromIndex < 0 ||
         fromIndex >= tabs.length ||
         toIndex < 0 ||
         toIndex >= tabs.length
      ) {
         return;
      }

      const [movedTab] = tabs.splice(fromIndex, 1);
      tabs.splice(toIndex, 0, movedTab);
   }

   // Getters útiles para el sistema de pestañas
   get activeNoteId(): Note["id"] | undefined {
      return this.getActiveTab()?.noteReference?.noteId;
   }

   get tabs(): Tab[] {
      return this.workspaceRepository.tabs;
   }

   get hasActiveTabs(): boolean {
      return this.workspaceRepository.tabs.length > 0;
   }

   get activeTabIndex(): number | undefined {
      const activeTabId = this.workspaceRepository.activeTabId;
      if (activeTabId) {
         return this.findTabIndexByTabId(activeTabId);
      }
      return undefined;
   }

   // Navegación entre pestañas
   nextTab() {
      const tabs = this.workspaceRepository.tabs;
      if (tabs.length <= 1) return;

      const currentIndex = this.activeTabIndex;
      if (currentIndex) {
         const nextIndex = (currentIndex + 1) % tabs.length;
         this.activateTabByNoteId(tabs[nextIndex].id);
      }
   }

   previousTab() {
      const tabs = this.workspaceRepository.tabs;
      if (tabs.length <= 1) return;

      const currentIndex = this.activeTabIndex;
      if (currentIndex) {
         const prevIndex =
            currentIndex <= 0 ? tabs.length - 1 : currentIndex - 1;
         this.activateTabByNoteId(tabs[prevIndex].id);
      }
   }
}

let instance: WorkspaceController | null = null;

export const workspaceController = new Proxy(
   {},
   {
      get(_, prop) {
         if (!instance) instance = new WorkspaceController();
         const value = instance[prop as keyof WorkspaceController];
         return typeof value === "function" ? value.bind(instance) : value;
      },
   },
) as WorkspaceController;

```
WorkspaceRepository.ts
```
import type { Tab } from "@projectTypes/ui/uiTypes";
import { LocalStorageAdapter } from "@infrastructure/persistence/LocalStorageAdapter.svelte";
import { Note } from "@domain/entities/Note";

interface WorkspaceData {
   tabs: Tab[];
   activeTabId: string | undefined;
}

export class WorkspaceRepository extends LocalStorageAdapter<WorkspaceData> {
   settingsAplied = false;
   constructor() {
      super("NoteNavigation");
   }

   protected getDefaultData(): WorkspaceData {
      return {
         tabs: [],
         activeTabId: undefined,
      };
   }

   get tabs() {
      return this.data.tabs;
   }
   set tabs(newValue: Tab[]) {
      this.data.tabs = newValue;
   }
   get activeNoteId(): Note["id"] | undefined {
      return this.getActiveTab()?.noteReference?.noteId;
   }
   get activeTabId(): Tab["id"] | undefined {
      return this.data.activeTabId;
   }
   set activeTabId(newValue: Tab["id"] | undefined) {
      this.data.activeTabId = newValue;
   }

   get hasActiveTabs(): boolean {
      return this.data.tabs.length > 0;
   }

   getTabByTabId(tabId: Tab["id"]): Tab | undefined {
      return this.data.tabs.find((tab: Tab) => tab.id === tabId);
   }
   getTabByNoteId(noteId: Note["id"]): Tab | undefined {
      return this.data.tabs.find(
         (tab: Tab) => tab.noteReference?.noteId === noteId,
      );
   }
   getActiveTab(): Tab | undefined {
      const activeId = this.data.activeTabId;
      if (activeId) {
         return this.getTabByTabId(activeId);
      }
      return undefined;
   }

   
}

```

Quiero que mires si te parece una buena arquitectura o incluirias algo mas y luego si ves que la distribución de metodos es buena o cambiarias alguno de sitio

Habia pensado en crearle un service para extraer la lógica compleja del controlador, en mi arquitectura son sin estado

Esta es la arquitectura resumida de mi aplicación

# 🏗️ Arquitectura de la Aplicación

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

# Ejemplo NotePathService

Te voy a pasar de ejemplo uno de mis service llamado NotePathService

```
import { Note } from "@domain/entities/Note";
import { sanitizeTitle } from "@utils/noteUtils";
import { normalizeText } from "@utils/searchUtils";

export interface PathResolution {
   existingNotes: Note[];
   missingSegments: string[];
   lastParentId?: string;
}

/**
 * Servicio de dominio para manejar paths jerárquicos de notas
 */
export class NotePathService {
   /**
    * Parsea un path en segmentos válidos
    */
   parseNotePath(path: string): string[] {
      if (!path?.trim()) return [];

      return path
         .split("/")
         .map((segment) => sanitizeTitle(segment.trim()))
         .filter(Boolean);
   }

   /**
    * Resuelve un path jerárquico y determina qué notas existen y cuáles faltan
    */
   resolveNotePath(pathSegments: string[], allNotes: Note[]): PathResolution {
      const resolution: PathResolution = {
         existingNotes: [],
         missingSegments: [],
         lastParentId: undefined,
      };

      let currentParentId: string | undefined;

      for (const segment of pathSegments) {
         const existingNote = this.findNoteByTitleAndParent(
            segment,
            currentParentId,
            allNotes,
         );

         if (existingNote) {
            resolution.existingNotes.push(existingNote);
            currentParentId = existingNote.id;
         } else {
            // Primer segmento faltante - guardar resto y salir
            const currentIndex = resolution.existingNotes.length;
            resolution.missingSegments = pathSegments.slice(currentIndex);
            resolution.lastParentId = currentParentId;
            break;
         }
      }

      return resolution;
   }

   /**
    * Busca una nota por título exacto y padre específico
    */
   private findNoteByTitleAndParent(
      title: string,
      parentId: string | undefined,
      allNotes: Note[],
   ): Note | null {
      const normalizedTitle = normalizeText(title);

      return (
         allNotes.find((note) => {
            const matchesParent = note.parentId === parentId;
            const matchesTitle = normalizeText(note.title) === normalizedTitle;
            return matchesParent && matchesTitle;
         }) || null
      );
   }

   /**
    * Genera una lista de títulos únicos para las notas faltantes
    */
   generateUniqueSegmentTitles(
      missingSegments: string[],
      parentId: string | undefined,
      allNotes: Note[],
   ): { parentId: string | undefined; title: string }[] {
      const result: { parentId: string | undefined; title: string }[] = [];
      let currentParentId = parentId;

      for (const segment of missingSegments) {
         // Obtener notas hermanas para validar unicidad
         const siblingNotes = allNotes.filter(
            (note) => note.parentId === currentParentId,
         );

         // Generar título único si es necesario
         const uniqueTitle = this.ensureUniqueTitle(segment, siblingNotes);

         result.push({
            parentId: currentParentId,
            title: uniqueTitle,
         });

         // El ID real se asignará cuando se cree la nota
         // Por ahora usamos un placeholder
         currentParentId = `pending-${result.length}`;
      }

      return result;
   }

   /**
    * Asegura que un título sea único entre notas hermanas
    */
   private ensureUniqueTitle(
      proposedTitle: string,
      siblingNotes: Note[],
   ): string {
      let title = proposedTitle;
      let counter = 1;

      while (siblingNotes.some((note) => note.title === title)) {
         title = `${proposedTitle} ${counter}`;
         counter++;
      }

      return title;
   }

   /**
    * Convierte un array de notas en un path string
    */
   buildPathString(notes: Note[]): string {
      return notes.map((note) => note.title).join("/");
   }

   /**
    * Obtiene el path completo de una nota como array
    */
   getNotePath(noteId: string, allNotes: Note[]): Note[] {
      const path: Note[] = [];
      let currentNote = allNotes.find((n) => n.id === noteId);

      while (currentNote) {
         path.unshift(currentNote);
         currentNote = currentNote.parentId
            ? allNotes.find((n) => n.id === currentNote!.parentId)
            : undefined;
      }

      return path;
   }
}

```
