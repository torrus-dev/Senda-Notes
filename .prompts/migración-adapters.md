Estoy migrando mi aplicación de notas local tipo Notion (Svelte + Electron) a una nueva arquitectura inspirada en DDD. En mi carpeta infrastructure tengo:

```
infrastructure/
├── persistence/
│   ├── LocalStorageAdapter.svelte.ts
│   └── JsonFileAdapter.svelte.ts
└── repositories/
    ├── NoteRepository.ts
    └── ...
```

Código:
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

MI PROBLEMA: La estructura actual usa un atributo `data` reactivo con Svelte ($state), lo cual funciona para localStorage/JSON pero no serviría para futuros adaptadores como SQLite que necesitarían hacer queries en lugar de mantener datos en memoria.

¿Cómo debería estructurar estos adaptadores para que:

1. Los actuales (localStorage/JSON) mantengan su estructura con `data`
2. Futuros adaptadores (SQLite) puedan usar queries sin `data`
3. Los repositorios puedan usar cualquier adaptador sin conocer su implementación interna?

Contexto adicional: Uso Svelte 5 con reactividad $state() y los repositorios heredan de estos adaptadores.
