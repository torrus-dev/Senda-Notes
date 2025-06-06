<style>
</style>

<script lang="ts">
import { onMount, type Snippet } from "svelte";
import { ChevronDownIcon } from "lucide-svelte";
import { collapsibleController } from "@controllers/ui/collapsibleController.svelte";

let {
   id,
   defaultCollapsed,
   headingContent,
   additionalContent,
   headingClass,
   hasSeparator = false,
   chevronPosition = "right",
   children,
}: {
   id: string;
   defaultCollapsed?: boolean;
   headingContent: Snippet;
   additionalContent?: Snippet;
   headingClass?: string;
   hasSeparator?: boolean;
   chevronPosition?: "floating-left" | "left" | "right";
   children?: Snippet;
} = $props();

onMount(() => {
   collapsibleController.register(id, defaultCollapsed);
});

let isCollapsed = $derived(collapsibleController.getState(id));

function toggle(): void {
   collapsibleController.toggle(id);
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

         <div class="flex grow items-center justify-between">
            <!-- Heading Svelte Snippet -->
            <button class="flex-grow" onclick={toggle}>
               {@render headingContent()}
            </button>

            {#if additionalContent}
               <div>
                  {@render additionalContent()}
               </div>
            {/if}
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
