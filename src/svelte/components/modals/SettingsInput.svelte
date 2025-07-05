<style>
.slider::-webkit-slider-thumb {
   appearance: none;
   height: 20px;
   width: 20px;
   border-radius: 50%;
   background: #3b82f6;
   cursor: pointer;
   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
   height: 20px;
   width: 20px;
   border-radius: 50%;
   background: #3b82f6;
   cursor: pointer;
   border: none;
   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>

<!-- SettingInput.svelte -->
<script lang="ts">
import type { SettingDefinition } from "@projectTypes/core/settingsTypes";
import { settingsController } from "@controllers/application/settingsController.svelte";
import Slider from "@components/utils/Slider.svelte";

interface Props {
   setting: SettingDefinition;
}

let { setting }: Props = $props();

// Obtener valor actual reactivo
let currentValue = $derived(settingsController.get(setting.key as any));

// Función para manejar cambios
function handleChange(value: any) {
   const success = settingsController.set(setting.key as any, value);
   if (!success) {
      console.error(`Failed to set ${setting.key} to ${value}`);
   }
}

// Función para manejar toggle de booleanos
function handleToggle() {
   settingsController.toggle(setting.key as any);
}
</script>

<div class="flex items-center justify-between px-1 py-3">
   <div class="flex min-w-0 flex-1 flex-col">
      <span class="font-medium text-gray-900 dark:text-gray-100">
         {setting.label}
      </span>
      {#if setting.description}
         <span
            class="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {setting.description}
         </span>
      {/if}
   </div>

   <div class="ml-6 flex-shrink-0">
      {#if setting.type === "boolean"}
         <Slider value={currentValue} onChange={handleToggle} />
      {:else if setting.type === "select"}
         <select
            class="min-w-[120px] rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            value={currentValue}
            onchange={(event) => {
               const target = event.target as HTMLSelectElement;
               handleChange(target.value);
            }}>
            {#each setting.options as option}
               <option value={option.value}>{option.label}</option>
            {/each}
         </select>
      {:else if setting.type === "number"}
         <input
            type="number"
            class="w-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            value={currentValue}
            min={setting.min}
            max={setting.max}
            step={setting.step}
            oninput={(event) => {
               const target = event.target as HTMLInputElement;
               if (target?.value !== "") {
                  handleChange(Number(target.value));
               }
            }} />
      {:else if setting.type === "range"}
         <div class="flex items-center gap-3">
            <input
               type="range"
               class="slider h-2 w-32 cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
               value={currentValue}
               min={setting.min}
               max={setting.max}
               step={setting.step || 1}
               oninput={(event) => {
                  const target = event.target as HTMLInputElement;
                  handleChange(Number(target.value));
               }} />
            <span
               class="w-8 text-center font-mono text-sm text-gray-600 dark:text-gray-400">
               {currentValue}
            </span>
         </div>
      {:else if setting.type === "string"}
         <input
            type="text"
            class="min-w-[200px] rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            value={currentValue}
            maxlength={setting.maxLength}
            placeholder={setting.placeholder}
            oninput={(event) => {
               const target = event.target as HTMLInputElement;
               handleChange(target.value);
            }} />
      {/if}
   </div>
</div>
