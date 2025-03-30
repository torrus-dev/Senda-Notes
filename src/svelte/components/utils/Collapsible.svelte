<style>
</style>

<script lang="ts">
import { type Snippet } from "svelte";
import Button from "@components/utils/Button.svelte";

interface CollapsibleProps {
   collapsed?: boolean;
   headingContent?: Snippet;
   children?: Snippet;
}

let {
   collapsed = false,
   headingContent,
   children,
}: CollapsibleProps = $props();
let isCollapsed = $state<boolean>(collapsed);

// Función para alternar el estado
function toggle(): void {
   console.log("Toggle");

   isCollapsed = !isCollapsed;
}
</script>

<div class="collapsible">
   {#if headingContent}
      <Button on:click={toggle} type="button" aria-expanded={!isCollapsed}>
         <span class="heading">
            {@render headingContent()}
         </span>
         <span class="icon">{isCollapsed ? "▼" : "▲"}</span>
      </Button>
   {/if}

   {#if children}
      <div class="content {{ hidden: isCollapsed }}" aria-hidden={isCollapsed}>
         {@render children()}
      </div>
   {/if}
</div>
