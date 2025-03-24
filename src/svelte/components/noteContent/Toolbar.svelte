<script>
import Button from "../utils/Button.svelte";

import {
  BoldIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
} from "lucide-svelte";
import { useResponsive } from "../../../directives/useResponsive.svelte";
import { settingsController } from "../../../controllers/settingsController.svelte";

let isMobile = $derived(useResponsive().isMobile);
</script>

{#if settingsController.showToolbar || isMobile}
  <div class="flex gap-1 p-1">
    <Button><BoldIcon /></Button>
    <Button><ItalicIcon /></Button>
    <p class="w-1"></p>
    <Button><Heading1Icon /></Button>
    <Button><Heading2Icon /></Button>
    <Button><Heading3Icon /></Button>
  </div>
{/if}
