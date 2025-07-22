<script lang="ts">
import GlobalPropertyMenu from "@components/globalProperties/GlobalPropertyMenu.svelte";
import Slider from "@components/utils/Slider.svelte";
import { settingsController } from "@controllers/application/SettingsController.svelte";
import { getCategories, getSettingsByCategory } from "@schema/settingsSchema";

let searchQuery = $state("");

// Obtener todas las categorías
const categories = getCategories();

// Función helper para capitalizar la primera letra
function capitalize(str: string): string {
   return str.charAt(0).toUpperCase() + str.slice(1);
}
</script>

<div class="flex w-full flex-col gap-6">
   <!-- Input de búsqueda -->
   <input
      type="text"
      placeholder="Buscar configuraciones..."
      class="mt-0.5 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
      bind:value={searchQuery} />
   {#each categories as category}
      {@const categorySettings = getSettingsByCategory(category, searchQuery)}
      {#if categorySettings.length > 0}
         <div class="flex flex-col gap-4">
            <h3 class="border-b border-gray-200 pb-2 text-lg font-semibold">
               {capitalize(category)}
            </h3>

            {#each categorySettings as { key, setting }}
               <div class="flex flex-col gap-1 py-2">
                  <div class="flex items-center justify-between">
                     <div>
                        <div class="font-medium">{setting.title}</div>
                        <div class="text-sm">{setting.description}</div>
                     </div>

                     {#if setting.type === "boolean"}
                        <Slider
                           value={Boolean(settingsController.get(key))}
                           onChange={() => settingsController.toggle(key)} />
                     {:else if setting.type === "select"}
                        <select
                           class="ml-4 rounded border px-2 py-1"
                           value={settingsController.get(key)}
                           onchange={(event) => {
                              const target = event.target as HTMLSelectElement;
                              settingsController.set(key, target.value as any);
                           }}>
                           {#each setting.options || [] as option}
                              <option value={option}>{option}</option>
                           {/each}
                        </select>
                     {:else if setting.type === "number"}
                        <input
                           type="number"
                           class="ml-4 w-20 rounded border px-2 py-1"
                           value={settingsController.get(key)}
                           min={setting.min}
                           max={setting.max}
                           oninput={(event) => {
                              const target = event.target as HTMLInputElement;
                              if (target?.value) {
                                 settingsController.set(
                                    key,
                                    Number(target.value) as any,
                                 );
                              }
                           }} />
                     {:else if setting.type === "string"}
                        <input
                           type="text"
                           class="ml-4 rounded border px-2 py-1"
                           value={settingsController.get(key)}
                           oninput={(event) => {
                              const target = event.target as HTMLInputElement;
                              settingsController.set(key, target.value as any);
                           }} />
                     {/if}
                  </div>
               </div>
            {/each}
         </div>
      {/if}
   {/each}

   <GlobalPropertyMenu />
</div>
