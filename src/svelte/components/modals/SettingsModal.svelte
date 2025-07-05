<!-- SettingsModal.svelte -->
<script lang="ts">
import SettingInput from "./SettingsInput.svelte";
import {
   SETTING_CATEGORIES,
   SETTINGS_SCHEMA,
   getSettingsByCategory,
   type AppSettingDefinition,
} from "@schema/settingsSchema";
import { settingsController } from "@controllers/application/settingsController.svelte";

let searchQuery = $state("");
let selectedCategory = $state("all");
let isExporting = $state(false);
let isImporting = $state(false);
let importText = $state("");
let importError = $state("");

// Filtrar configuraciones por búsqueda y categoría
let filteredSettings = $derived(() => {
   let settings: AppSettingDefinition[] = [...SETTINGS_SCHEMA];

   if (selectedCategory !== "all") {
      settings = getSettingsByCategory(selectedCategory);
   }

   if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      settings = settings.filter(
         (setting) =>
            setting.label.toLowerCase().includes(query) ||
            setting.description?.toLowerCase().includes(query) ||
            setting.key.toLowerCase().includes(query),
      );
   }

   return settings;
});

// Agrupar configuraciones por categoría para mostrar
let settingsByCategory = $derived(() => {
   const groups: Record<string, AppSettingDefinition[]> = {};

   for (const setting of filteredSettings) {
      const category = setting.category || "general";
      if (!groups[category]) {
         groups[category] = [];
      }
      groups[category].push(setting);
   }

   return groups;
});

// Función para exportar configuraciones
async function exportSettings() {
   try {
      isExporting = true;
      const exported = settingsController.exportSettings();
      await navigator.clipboard.writeText(exported);

      // Mostrar feedback visual
      const exportBtn = document.querySelector("#export-btn");
      if (exportBtn) {
         exportBtn.textContent = "Copied!";
         setTimeout(() => {
            exportBtn.textContent = "Export";
         }, 2000);
      }
   } catch (error) {
      console.error("Error exporting settings:", error);
   } finally {
      isExporting = false;
   }
}

// Función para importar configuraciones
async function importSettings() {
   try {
      isImporting = true;
      importError = "";

      const success = await settingsController.importSettings(importText);

      if (success) {
         importText = "";
         importError = "";
         // Mostrar feedback de éxito
         const importBtn = document.querySelector("#import-btn");
         if (importBtn) {
            importBtn.textContent = "Imported!";
            setTimeout(() => {
               importBtn.textContent = "Import";
            }, 2000);
         }
      } else {
         importError = "Invalid JSON format or some settings failed to import";
      }
   } catch (error) {
      importError = "Error importing settings: " + (error as Error).message;
   } finally {
      isImporting = false;
   }
}

// Función para resetear configuraciones
function resetSettings() {
   if (
      confirm(
         "Are you sure you want to reset all settings to their default values?",
      )
   ) {
      settingsController.resetToDefaults();
   }
}
</script>

<aside class="mx-auto min-h-screen max-w-4xl bg-white p-6 dark:bg-gray-900">
   <!-- Header -->
   <div class="mb-8 flex items-center justify-between">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
         Settings
      </h2>
      <div class="flex gap-3">
         <button
            id="export-btn"
            class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isExporting}
            onclick={exportSettings}>
            {isExporting ? "Exporting..." : "Export"}
         </button>
         <button
            class="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            onclick={resetSettings}>
            Reset to Defaults
         </button>
      </div>
   </div>

   <!-- Import Section -->
   <div class="mb-8 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
      <h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
         Import Settings
      </h3>
      <div class="space-y-3">
         <textarea
            class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            rows="4"
            placeholder="Paste exported settings JSON here..."
            bind:value={importText}></textarea>

         {#if importError}
            <div class="text-sm text-red-600 dark:text-red-400">
               {importError}
            </div>
         {/if}

         <button
            id="import-btn"
            class="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isImporting || !importText.trim()}
            onclick={importSettings}>
            {isImporting ? "Importing..." : "Import"}
         </button>
      </div>
   </div>

   <!-- Search -->
   <div class="mb-6">
      <input
         type="text"
         placeholder="Search settings..."
         class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
         bind:value={searchQuery} />
   </div>

   <!-- Category Filters -->
   <div class="mb-8">
      <div class="flex flex-wrap gap-2">
         <button
            class="rounded-full px-4 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            class:bg-blue-600={selectedCategory === "all"}
            class:text-white={selectedCategory === "all"}
            class:bg-gray-200={selectedCategory !== "all"}
            class:dark:bg-gray-700={selectedCategory !== "all"}
            class:text-gray-900={selectedCategory !== "all"}
            class:dark:text-gray-100={selectedCategory !== "all"}
            onclick={() => (selectedCategory = "all")}>
            All
         </button>
         {#each SETTING_CATEGORIES as category}
            <button
               class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
               class:bg-blue-600={selectedCategory === category.key}
               class:text-white={selectedCategory === category.key}
               class:bg-gray-200={selectedCategory !== category.key}
               class:dark:bg-gray-700={selectedCategory !== category.key}
               class:text-gray-900={selectedCategory !== category.key}
               class:dark:text-gray-100={selectedCategory !== category.key}
               onclick={() => (selectedCategory = category.key)}>
               <span>{category.icon}</span>
               <span>{category.label}</span>
            </button>
         {/each}
      </div>
   </div>

   <!-- Settings Groups -->
   <div class="space-y-8">
      {#each Object.entries(settingsByCategory) as [categoryKey, settings]}
         {@const category = SETTING_CATEGORIES.find(
            (c) => c.key === categoryKey,
         )}
         <div
            class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3
               class="mb-2 flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
               {#if category}
                  <span class="text-2xl">{category.icon}</span>
                  <span>{category.label}</span>
               {:else}
                  <span>General</span>
               {/if}
            </h3>

            {#if category?.description}
               <p class="mb-6 text-gray-600 dark:text-gray-400">
                  {category.description}
               </p>
            {/if}

            <div class="space-y-1">
               {#each settings as setting}
                  <SettingInput setting={setting} />
               {/each}
            </div>
         </div>
      {/each}
   </div>

   <!-- Empty State -->
   {#if filteredSettings.length === 0}
      <div class="py-16 text-center text-gray-500 dark:text-gray-400">
         <div class="mb-4 text-6xl">🔍</div>
         <p class="text-xl">No settings found matching your search.</p>
         <p class="mt-2 text-sm">
            Try adjusting your search terms or category filter.
         </p>
      </div>
   {/if}
</aside>
