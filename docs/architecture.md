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
