# Migración de arquitectura - Sistema de Propiedades

## Contexto
Estoy migrando una aplicación tipo Notion (Svelte + Electron) de una arquitectura con controladores gordos + modelos anémicos hacia una arquitectura ligera inspirada en DDD.

Ya he migrado exitosamente el sistema de Notas con esta estructura:
```
domain/
├── Note.ts                    # Entidad rica
├── NotePathService.ts         # Servicios de dominio
└── NoteTreeService.ts
application/
└── NoteUseCases.ts           # Casos de uso
infrastructure/
├── NoteRepository.ts         # Commands
└── NoteQueryRepository.ts    # Queries
controllers/
├── NoteController.ts         # Coordinación UI (delgado)
└── NoteQueryController.ts
```

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
      const index = this.properties.findIndex(p => p.id === propertyId);
      if (index !== -1) {
         this.properties.splice(index, 1);
         this.updateModified();
      }
   }
   
   updateProperty(propertyId: string, updates: Partial<NoteProperty>): void {
      const property = this.properties.find(p => p.id === propertyId);
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

export type NoteProperty =
   | TextProperty     // { type: "text"; value: string }
   | ListProperty     // { type: "list"; value: string[] }
   | NumberProperty   // { type: "number"; value: number }
   | CheckProperty    // { type: "check"; value: boolean }
   | DateProperty     // { type: "date"; value: Date }
   | DateTimeProperty // { type: "datetime"; value: DateTime }

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

```
GlobalPropertyController
```
```

## Objetivo
Necesito migrar el sistema de propiedades siguiendo la misma arquitectura:
1. Crear entidades ricas para Property y GlobalProperty
2. Crear servicios de dominio si hay lógica compleja
3. Separar repositorios Query/Command
4. Crear casos de uso para operaciones multi-entidad
5. Adelgazar controladores para solo coordinación UI

Las propiedades tienen una particularidad: pueden estar vinculadas a propiedades globales para compartir el mismo nombre/tipo entre múltiples notas.

¿Cómo debería estructurar esta migración manteniendo la coherencia con lo ya hecho en notas?