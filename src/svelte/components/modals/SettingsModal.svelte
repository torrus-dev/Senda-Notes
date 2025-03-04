<script>
import { SearchIcon } from "lucide-svelte";
let selectedTab = 0;
let searchQuery = $state("");
</script>

<aside>
  <div class="bg-base-400 flex items-center rounded px-2 py-1">
    <SearchIcon class="h-5 w-5 text-gray-500" />
    <input
      type="text"
      name="search"
      class="ml-2 flex-1 bg-transparent focus:outline-none"
      bind:value={searchQuery}
      placeholder="Buscar..." />
  </div>
  <h3>Configuración</h3>
</aside>
<main></main>
