<style>
</style>

<script lang="ts">
import { type Snippet } from "svelte";
import { ChevronDownIcon } from "lucide-svelte";

interface CollapsibleProps {
   collapsed?: boolean;
   headingContent?: Snippet;
   children?: Snippet;
   chevronLeft?: "floating-left" | "left" | "right";
}

let {
   collapsed = false,
   headingContent,
   children,
   chevronLeft = "right",
}: CollapsibleProps = $props();
let isCollapsed = $state<boolean>(collapsed);

// Función para alternar el estado
function toggle(): void {
   isCollapsed = !isCollapsed;
}
</script>

<div>
   {#if headingContent}
      <button
         type="button"
         onclick={toggle}
         class="flex w-full cursor-pointer justify-between py-2
         {chevronLeft ? 'relative' : ''}"
         aria-expanded={!isCollapsed}>
         {@render headingContent()}
         <div
            class="rounded-field p-1 {chevronLeft === 'floating-left'
               ? 'hover:bg-interactive absolute left-[-1.75em]'
               : ''}">
            <ChevronDownIcon
               size="1.125rem"
               class="transition duration-300 {isCollapsed ? '-rotate-90' : ''}"
            ></ChevronDownIcon>
         </div>
      </button>
   {/if}

   {#if children}
      <div
         class="content {isCollapsed ? 'hidden' : ''}"
         aria-hidden={isCollapsed}>
         {@render children()}
      </div>
   {/if}
</div>
