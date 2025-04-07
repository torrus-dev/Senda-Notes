<style>
</style>

<script lang="ts">
import { type Snippet } from "svelte";
import { ChevronDownIcon } from "lucide-svelte";

interface CollapsibleProps {
   collapsed?: boolean;
   headingContent?: Snippet;
   children?: Snippet;
   chevronPosition?: "floating-left" | "left" | "right";
}

let {
   collapsed = false,
   headingContent,
   children,
   chevronPosition = "right",
}: CollapsibleProps = $props();
let isCollapsed: boolean = $state(collapsed);

function toggle(): void {
   isCollapsed = !isCollapsed;
}
</script>

<div>
   {#if headingContent}
      <button
         type="button"
         onclick={toggle}
         class="flex w-full cursor-pointer items-center px-0.5 py-2
         {chevronPosition === 'floating-left' ? 'relative' : ''}"
         aria-expanded={!isCollapsed}>
         {#if chevronPosition === "left"}
            <div class="rounded-field mr-2 p-1">
               <ChevronDownIcon
                  size="1.125rem"
                  class="transition duration-300 
                  {isCollapsed ? '-rotate-90' : ''}" />
            </div>
         {/if}
         <div class="flex-grow">
            {@render headingContent()}
         </div>
         {#if chevronPosition === "right"}
            <div class="rounded-field p-1">
               <ChevronDownIcon
                  size="1.125rem"
                  class="transition duration-300 {isCollapsed
                     ? '-rotate-90'
                     : ''}" />
            </div>
         {/if}

         {#if chevronPosition === "floating-left"}
            <div
               class="rounded-field hover:bg-interactive absolute left-[-1.75em] p-1">
               <ChevronDownIcon
                  size="1.125rem"
                  class="transition duration-300 {isCollapsed
                     ? '-rotate-90'
                     : ''}" />
            </div>
         {/if}
      </button>
   {/if}

   {#if children}
      <div class={isCollapsed ? "hidden" : ""} aria-hidden={isCollapsed}>
         {@render children()}
      </div>
   {/if}
</div>
