# Contexto y problema
Estoy refacorizando y arreglando partes cruciales de mi aplicación de notas local tipo Notion (Svelte 5 + Vite + Electron), es un proyecto individual mio por hobbie. 

La estructura de repository + adapter actual usa un atributo "data" con $state() reactivo dentro de los adaptadores que guarda automaticamente los datos mediante un $effect() cuando cambia data. 

Esto funciona teniendo todo en memoria y los repository manipulan directamente esa variable "data". Pero no nos da ninguna interfaz comun con metodos y hace que los repositorios tengan que manipular la variable directamente sin ningún tipo de abstracción. 

Esta bien para una aplicación pequeña pero no es algo escalable o extendible y esta muy poco pulido, tambien el tener tanta reactividad entrelazada causa problemas en mi aplicación.

## Objetivo y refactorización

La transición va a ser complicada porque este sistema tiene varios problemas que se entrelazan

Esta es la tarea que quiero realizar:

Eliminar el $effect de auto-guardado en LocalStorageAdapter y JsonFileAdapter. 
Implementar guardado manual mediante método save(). 
Para accionar el guardado (me encargo yo)
- Repositories de UI simple (sidebar, theme, collapsibles), llamar save() directamente en los setters del repository. 
- Para repositories de lógica de negocio (notes, properties), NO poner save() en los métodos del repository, sino que los UseCases deben llamar save() explícitamente después de las modificaciones. Esto permite operaciones batch eficientes y transacciones coordinadas entre múltiples repositories en los casos de uso complejos, mientras mantiene la simplicidad para estados de UI básicos.

Habia pensado en crear una interfaz común para los adapters con metodos getById, getAll, save, update, delete y no tener ninguna variable data.



Quiero modificar los adaptadores y repositories para que no dependan de una variable "data" y en su lugar expongan .
Tener una interfaz común con estos metodos
Tambien simplifica e implementa mejoras donde veas oportuno.
Quiero que los repositories puedan usar cualquier adaptador sin conocer su implementación interna y que los controladores no se metan a modificar datos directamente a los repositories (abstracción) 

### A tener en cuenta:

- Me da igual romper la compatibilidad, el código antiguo eliminalo.
- Actualmente se usa un $effect para automatizar el guardado pero podria cambiarse a oro sistema
- Tengo el problema de que ahora hay repositories anemicos y controladores que saben mucho de los repositories y manipulan data directamente porque sus repositorys no implementan ningún metodo, pero de esto ya me encargare yo.

Contexto adicional: Uso Svelte 5 con reactividad $state() y los repositorios heredan de estos adaptadores, este sistema se puede cambiar según veas combeniente, pero hay que mantener la reactividad para que los componentes svelte reaccionen a los cambios de datos.

Por problemas con la inicialización (controladores trataban de acceder a datos cuando aun no habia cargado), tuve que crear un archivo startupManager.ts y para que estuviese el metodo inicitialize en todos los repository lo puse en los adapters por defecto. 
Creo que hay cosas que no deberian estar en los adapters y que hacen demasiadas cosas, solo deberian seguir una interfaz y dar acceso a los repositories a los datos. Creo que el que sea una clase abstracta de la que se pueda extender esta bien, pero el sistema de inicialización y carga centralizada no esta todo lo pulido que deberia.

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
      this.loadData();
      this.isInitialized = true;

      // Auto-guardar al detectar cambios
      $effect.root(() => {
         $effect(() => {
            if (this.isInitialized) {
               JSON.stringify(this.data);
               this.saveData();
            }
         });
      });
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

   private saveData(): void {
      try {
         const serializableData = this.serializeData(this.data);
         localStorage.setItem(
            this.storageKey,
            JSON.stringify(serializableData),
         );
      } catch (error) {
         console.warn(
            `Error saving ${this.storageKey} to localStorage:`,
            error,
         );
      }
   }

   protected loadData(): void {
      try {
         const stored = localStorage.getItem(this.storageKey);
         if (stored) {
            const parsedData = JSON.parse(stored);
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
}
```

JsonFileAdapter.svelte.ts

```
export abstract class JsonFileAdapter<T> {
   data: T = $state() as T;
   public isInitialized = $state(false);
   private saveTimeout: number | null = null;
   private readonly DEBOUNCE_DELAY = 500; // ms
   private initializationPromise: Promise<void> | null = null;

   constructor(private filename: string) {}

   public async initialize(): Promise<void> {
      if (this.initializationPromise) {
         return this.initializationPromise;
      }

      this.initializationPromise = this.initializeData();
      return this.initializationPromise;
   }

   private async initializeData(): Promise<void> {
      try {
         await this.loadData();
         this.isInitialized = true;

         // Configurar auto-guardado al detectar cambios
         $effect.root(() => {
            $effect(() => {
               if (this.isInitialized) {
                  JSON.stringify(this.data);
                  this.debouncedSave();
               }
            });
         });
      } catch (error) {
         console.error(
            `PersistentJsonFileModel: Error inicializando ${this.filename}:`,
            error,
         );
         this.data = this.getDefaultData();
         this.isInitialized = true; // Marcar como inicializado aunque falle
         throw error;
      }
   }

   // Método abstracto que deben implementar las clases hijas
   protected abstract getDefaultData(): T;

   private debouncedSave() {
      if (this.saveTimeout) {
         clearTimeout(this.saveTimeout);
      }

      this.saveTimeout = window.setTimeout(() => {
         this.saveData();
      }, this.DEBOUNCE_DELAY);
   }

   private async saveData() {
      try {
         const serializableData = $state.snapshot(this.data);
         const result = await window.electronAPI.fs.saveUserConfigJson(
            this.filename,
            serializableData,
         );
         if (!result.success) {
            console.error(
               `PersistentJsonFileModel: Error al guardar ${this.filename}:`,
               result.error,
            );
         } else {
            console.log(
               `PersistentJsonFileModel: Guardado archivo ${this.filename}`,
            );
         }
      } catch (error) {
         console.error(
            `PersistentJsonFileModel: Error al guardar ${this.filename}:`,
            error,
         );
      }
   }

   private async loadData() {
      try {
         const result = await window.electronAPI.fs.loadUserConfigJson(
            this.filename,
         );

         if (result.success && result.data) {
            // Combinar datos cargados con valores por defecto para manejar nuevas propiedades
            this.data = { ...this.getDefaultData(), ...result.data };
            console.log(
               `PersistentJsonFileModel: Datos cargados para ${this.filename}:`,
               this.data,
            );
         } else if (result.error !== "FILE_NOT_FOUND") {
            console.error(
               `PersistentJsonFileModel: Error al cargar ${this.filename}:`,
               result.error,
            );
         } else {
            console.warn(
               `PersistentJsonFileModel: Archivo ${this.filename} no encontrado, usando defaults`,
            );
         }
         // Si el archivo no existe (FILE_NOT_FOUND), se mantienen los valores por defecto
      } catch (error) {
         console.error(
            `PersistentJsonFileModel: Error al cargar ${this.filename}:`,
            error,
         );
         throw error;
      }
   }

   // Funciones Publicas Auxiliares
   // Método público para forzar guardado inmediato
   public async forceSave(): Promise<void> {
      if (this.saveTimeout) {
         clearTimeout(this.saveTimeout);
         this.saveTimeout = null;
      }
      await this.saveData();
   }

   // Método público para recargar datos
   public async reload(): Promise<void> {
      await this.loadData();
   }

   // Método público para resetear a valores por defecto
   public resetToDefaults(): void {
      this.data = this.getDefaultData();
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

SettingsRepository.ts

```
import { JsonFileAdapter } from "@infrastructure/persistence/JsonFileAdapter.svelte";
import {
   settingsSchema,
   getDefaultSettings,
   type AppSettings,
   type SettingsKey,
} from "@schema/settingsSchema";

/**
 * Repositorio para la configuración de la aplicación
 */
export class SettingsRepository extends JsonFileAdapter<AppSettings> {
   constructor() {
      super("app-settings");
   }

   protected getDefaultData(): AppSettings {
      return getDefaultSettings();
   }

   /**
    * Obtiene un valor de configuración
    */
   get<K extends SettingsKey>(key: K): AppSettings[K] {
      return this.data[key];
   }

   /**
    * Establece un valor de configuración con validación
    */
   set<K extends SettingsKey>(key: K, value: AppSettings[K]): void {
      if (this.isValidValue(key, value)) {
         this.data[key] = value;
      } else {
         throw new Error(`Invalid value for setting ${String(key)}: ${value}`);
      }
   }

   /**
    * Alterna un valor booleano
    */
   toggle<K extends SettingsKey>(key: K): void {
      const setting = settingsSchema[key];

      if (setting.type !== "boolean") {
         throw new Error(`Cannot toggle non-boolean setting: ${String(key)}`);
      }

      (this.data[key] as any) = !this.data[key];
   }

   /**
    * Incrementa un valor numérico
    */
   increment<K extends SettingsKey>(key: K, amount: number = 1): void {
      const setting = settingsSchema[key];

      if (setting.type !== "number") {
         throw new Error(`Cannot increment non-number setting: ${String(key)}`);
      }

      const currentValue = this.data[key] as number;
      let newValue = currentValue + amount;

      // Aplicar límites
      if (setting.max !== undefined && newValue > setting.max) {
         newValue = setting.max;
      } else if (setting.min !== undefined && newValue < setting.min) {
         newValue = setting.min;
      }

      (this.data[key] as any) = newValue;
   }

   /**
    * Resetea un valor a su default
    */
   reset<K extends SettingsKey>(key: K): void {
      const setting = settingsSchema[key];
      this.data[key] = setting.defaultValue as AppSettings[K];
   }

   /**
    * Resetea todos los valores
    */
   resetAll(): void {
      this.resetToDefaults();
   }

   /**
    * Valida si un valor es válido para una configuración
    */
   private isValidValue<K extends SettingsKey>(key: K, value: any): boolean {
      const setting = settingsSchema[key];

      switch (setting.type) {
         case "boolean":
            return typeof value === "boolean";
         case "number":
            if (typeof value !== "number") return false;
            if (setting.min !== undefined && value < setting.min) return false;
            if (setting.max !== undefined && value > setting.max) return false;
            return true;
         case "string":
            return typeof value === "string";
         case "select":
            return setting.options?.includes(value) ?? false;
         default:
            return false;
      }
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

# Tu respuesta

Primero quiero que hagas un analisis de la situación, creo que las 3 grandes cuestiones a abordar son:
1. Revisar y pulir el sistema de inicialización actual, el problema venia al usar el JSONFileAdapter pero quiero tener una forma estandarizada que funcione de inicializar todos los repositorios
2. En los adapters dejar de usar variable data y solo exponer los metodos descritos por la interfaz comúna los repositories