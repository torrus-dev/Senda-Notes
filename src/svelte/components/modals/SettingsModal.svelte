<script lang="ts">
import GlobalPropertyMenu from "@components/globalProperties/GlobalPropertyMenu.svelte";
import Slider from "@components/utils/Slider.svelte";
import { settingsController } from "@controllers/application/settingsController.svelte";
import { settingsSchema, type SettingsKey } from "@schema/settingsSchema";

let searchQuery = $state("");

// Obtener todas las keys del schema para iteración
const settingsKeys = Object.keys(settingsSchema) as SettingsKey[];
</script>

<aside class="gap-4">
   <h2 class="mb-8 py-2 text-2xl font-bold">Settings</h2>
   <div class="flex w-full flex-col gap-4">
      {#each settingsKeys as key}
         {@const setting = settingsSchema[key]}
         <div class="flex flex-col gap-1 py-2">
            <div class="flex items-center justify-between">
               <div class="flex flex-col">
                  <span class="font-medium">{setting.title}</span>
                  <span class="text-sm text-gray-600"
                     >{setting.description}</span>
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

      <GlobalPropertyMenu />
   </div>
</aside>
