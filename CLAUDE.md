# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Senda notes" is an Electron-based note-taking application and personal knowledge base built with SvelteKit, TypeScript, and TailwindCSS. It follows a simpler Domain Driven Design (DDD) principles with a layered architecture and uses TipTap for rich text editing.

## Development Commands

### Build and Development

- `npm run dev` - Start development mode with hot reload (Svelte, Electron, and Preload)
- `npm run build` - Build all components (Svelte, Electron, Preload)
- `npm run start` - Build and run the Electron app
- `npm run dist` - Build and package the app for distribution

### Individual Build Commands

- `npm run build:svelte` - Build Svelte frontend
- `npm run build:electron` - Build Electron main process
- `npm run build:preload` - Build Electron preload script
- `npm run dev:svelte` - Start Svelte dev server only

## Architecture Overview

### Core Architecture

The application follows a simpler Domain Driven Design with Clean Architecture principles:

```
src/
├── domain/           # Business logic and entities
├── application/      # Use cases and business workflows
├── infrastructure/   # External adapters (persistence, repositories)
├── controllers/      # Svelte controllers (reactive state management)
├── model/           # Application state models
├── svelte/          # UI components and views
└── electron/        # Electron main process
```

### Key Architectural Patterns

1. **Domain Layer**: Rich domain entities (`Note.ts`) with business logic
2. **Repository Pattern**: Separate command (`NoteRepository`) and query (`NoteQueryRepository`) responsibilities
3. **Use Cases**: Complex business workflows in `application/usecases/`
4. **Reactive Controllers**: Svelte-based controllers for state management
5. **Dependency Injection**: Services initialized via `StartupManager`

### Persistence Strategy

- **JsonFileAdapter**: Base class for file-based persistence
- **LocalStorageAdapter**: Base class for browser persistence
- **SQLiteAdapter**: Base class for SQLite persistence (not created)
- **Auto-save**: Changes to reactive state automatically trigger debounced saves (500ms)

### Path Aliases

The project uses extensive path aliases defined in `appAlias.js` and `tsconfig.json`:

- `@domain/*` → `src/domain/*`
- `@application/*` → `src/application/*`
- `@infrastructure/*` → `src/infrastructure/*`
- `@controllers/*` → `src/controllers/*`
- `@components/*` → `src/svelte/components/*`
- `@utils/*` → `src/lib/utils/*`
- `@projectTypes/*` → `src/types/*`

## Key Components

### Note Management

- **Note Entity** (`src/domain/entities/Note.ts`): Rich domain entity with business logic
- **NoteUseCases** (`src/application/usecases/NoteUseCases.ts`): Complex note operations
- **NoteRepository**: Command operations (create, update, delete)
- **NoteQueryRepository**: Query operations (find, search)

### Tree Structure

- **NoteTreeService**: Handles hierarchical note operations
- **NotePathService**: Manages note path resolution and creation
- Supports drag-and-drop reordering and nested note structures

### Editor

- Built with TipTap editor
- Custom extensions for clean paste and rich formatting
- Supports markdown-like editing with rich text output

### State Management

- **StartupManager**: Centralized initialization of all services and models
- **Reactive Models**: Svelte 5 runes-based state management
- **Controllers**: Reactive controllers for different UI concerns

## Development Guidelines

### Adding New Features

1. Start with domain entities and business logic
2. Create use cases for complex workflows
3. Add repository methods if needed
4. Create controllers for reactive state
5. Build UI components last

### Working with Notes

- Always use `NoteUseCases` for complex operations
- Direct repository access only for simple CRUD
- Use `Note.create()` for new note creation
- Validate note movements with `NoteTreeService.canMoveNote()`

### File Organization

- Domain logic stays in `src/domain/`
- UI components in `src/svelte/components/`
- Controllers handle reactive state, not business logic
- Use path aliases consistently

### Testing

- No specific test commands configured
- Focus on testing use cases and domain logic
- Test note tree operations thoroughly due to complexity

## Key Dependencies

- **Svelte 5**: UI framework with new runes system
- **TipTap**: Rich text editor
- **Luxon**: Date/time handling
- **TailwindCSS**: Styling
- **Electron**: Desktop app framework
- **TypeScript**: Type safety throughout
