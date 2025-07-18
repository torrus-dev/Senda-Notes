// Tipos exportados del sistema de startup

import type { GlobalPropertiesModel } from "@model/application/globalPropertiesModel.svelte";
import type { SettingsModel } from "@model/application/settingsModel.svelte";
import type { WorkspaceModel } from "@model/navigation/workspaceModel.svelte";
import type { CollapsibleModel } from "@model/ui/collapsibleModel.svelte";
import type { SidebarModel } from "@model/ui/sidebarModel.svelte";
import type { NoteRepository } from "@infrastructure/repositories/NoteRepository";
import type { NoteQueryRepository } from "@infrastructure/repositories/NoteQueryRepository";
import type { NoteUseCases } from "@application/usecases/NoteUseCases";
import type { NoteTreeService } from "@domain/services/NoteTreeService";
import type { NotePathService } from "@domain/services/NotePathService";

// Exportar interfaces para uso externo si es necesario
export interface ServiceMap {
   noteRepository: NoteRepository;
   noteQueryRepository: NoteQueryRepository;
   noteUseCases: NoteUseCases;
   noteTreeService: NoteTreeService;
   notePathService: NotePathService;
}

export interface ModelMap {
   settingsModel: SettingsModel;
   workspaceModel: WorkspaceModel;
   globalPropertiesModel: GlobalPropertiesModel;
   collapsibleModel: CollapsibleModel;
   sidebarModel: SidebarModel;
}

// Tipos de utilidad
export type ServiceName = keyof ServiceMap;
export type ModelName = keyof ModelMap;
export type ServiceType<K extends ServiceName> = ServiceMap[K];
export type ModelType<K extends ModelName> = ModelMap[K];
