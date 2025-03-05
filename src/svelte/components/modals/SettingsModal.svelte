<script>
import { SearchIcon } from "lucide-svelte";
let searchQuery = $state("");
let settingsData = {
  App: [
    {
      id: "language",
      title: "Lenguaje",
      description: "Cambiar lenguaje de la app",
      type: "select",
      options: ["Spanish", "English"],
      defaultValue: "English",
    },
  ],
  Apariencia: [
    {
      id: "themeMode",
      title: "Modo Claro / Oscuro",
      description: "",
      type: "select",
      options: ["Light", "Dark"],
      defaultValue: "System",
    },
  ],
};
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
  <h3>Settings</h3>
</aside>
<main></main>
