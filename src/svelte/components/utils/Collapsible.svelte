<style>
</style>

<script lang="ts">
import { type Snippet } from "svelte";
import { ChevronDownIcon } from "lucide-svelte";

interface CollapsibleProps {
   oncollapse?: () => void;
   startCollapsed?: boolean;
   headingContent: Snippet;
   headingClass?: string;
   hasSeparator?: boolean;
   children?: Snippet;
   chevronPosition?: "floating-left" | "left" | "right";
}

let {
   oncollapse,
   startCollapsed: collapsed = false,
   headingContent,
   headingClass,
   children,
   hasSeparator = false,
   chevronPosition = "right",
}: CollapsibleProps = $props();
let isCollapsed: boolean = $state(collapsed);

function toggle(): void {
   isCollapsed = !isCollapsed;
   if (oncollapse) {
      oncollapse();
   }
}

const chevronCollapseButtonStyles =
   "rounded-field p-1.5 cursor-pointer bg-interactive";
</script>

<div>
   {#if headingContent}
      <div
         class="flex w-full cursor-pointer items-center px-0.5 py-2
         {headingClass}
         {chevronPosition === 'floating-left' ? 'relative' : ''}"
         aria-expanded={!isCollapsed}>
         <!-- Collapse button -->
         {#if chevronPosition === "left"}
            <button
               class="{chevronCollapseButtonStyles} mr-1.5"
               onclick={toggle}>
               <ChevronDownIcon
                  size="1.125rem"
                  class="transition duration-300 
            {isCollapsed ? '-rotate-90' : ''}" />
            </button>
         {/if}

         <!-- Heading Svelte Snippet -->
         <div class="flex-grow">
            {@render headingContent()}
         </div>

         <!-- Collapse button -->
         {#if chevronPosition === "right"}
            <button class="{chevronCollapseButtonStyles} " onclick={toggle}>
               <ChevronDownIcon
                  size="1.125rem"
                  class="transition duration-300 {isCollapsed
                     ? '-rotate-90'
                     : ''}" />
            </button>
         {/if}
         {#if chevronPosition === "floating-left"}
            <button
               class="{chevronCollapseButtonStyles}  bg-interactive absolute left-[-1.75em]"
               onclick={toggle}>
               <ChevronDownIcon
                  size="1.125rem"
                  class="transition duration-300 {isCollapsed
                     ? '-rotate-90'
                     : ''}" />
            </button>
         {/if}
      </div>
   {/if}

   {#if hasSeparator}
      <hr class="border-base-400 mb-1" />
   {/if}

   {#if children}
      <div class={isCollapsed ? "hidden" : ""} aria-hidden={isCollapsed}>
         {@render children()}
      </div>
   {/if}
</div>
