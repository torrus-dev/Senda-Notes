<script>
import { SearchIcon } from "lucide-svelte";
import Button from "../utils/Button.svelte";
import { settingsController } from "../../../controllers/settingsController.svelte";

let searchQuery = $state("");
// let settingsData = {
// App: [
//   {
//     id: "language",
//     title: "Lenguaje",
//     description: "Cambiar lenguaje de la app",
//     type: "select",
//     options: ["Spanish", "English"],
//     defaultValue: "English",
//   },
// ],
// Apariencia: [
//   {
//     id: "themeMode",
//     title: "Modo Claro / Oscuro",
//     description: "",
//     type: "select",
//     options: ["Light", "Dark"],
//     defaultValue: "System",
//   },
// ],
// Por añadir;
// Sidebar siempre visible en pantallas medianas o grandes
// };
</script>

<aside class="flex gap-2">
  <div class="bg-base-400 flex items-center rounded px-2 py-1">
    <SearchIcon class="h-5 w-5 text-gray-500" />
    <input
      type="text"
      name="search"
      class="ml-2 flex-1 bg-transparent focus:outline-none"
      bind:value={searchQuery}
      placeholder="Search..." />
  </div>
  <main>
    <h3>Appereance</h3>
    <div class="flex flex-col">
      <Button
        cssClass="bordered"
        onclick={() => {
          settingsController.toggleThemeMode();
        }}>Toggle Dark/Light theme</Button>
      <Button
        cssClass="bordered"
        onclick={() => {
          settingsController.toggleLockSidebar();
        }}>Toggle Lock Sidebar</Button>
    </div>
  </main>
</aside>
