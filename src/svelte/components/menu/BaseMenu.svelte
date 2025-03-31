<script>
import Button from "@components/utils/Button.svelte";
import Check from "lucide-svelte/icons/check";
import ChevronRight from "lucide-svelte/icons/chevron-right";

// Props
let {
   items = [],
   position = { x: 0, y: 0 },
   activeIndex = -1,
   isRendered = false,
   zIndex = 20,
   onItemClick = (item, event) => {},
   onItemMouseEnter = (index) => {},
   showSubmenuIndicator = false,
   cssClass = "",
   menuElement,
} = $props();

// Bind al elemento del menú
// export let menuElement;
</script>

<ul
   bind:this={menuElement}
   role="menu"
   aria-orientation="vertical"
   tabindex="-1"
   class="
    rounded-box bordered bg-base-200 absolute min-w-[160px] p-1 shadow-xl
    {cssClass}
  "
   style="
    left: {position.x}px; 
    top: {position.y}px; 
    z-index: {zIndex}; 
    visibility: {isRendered || true ? 'visible' : 'hidden'}; 
    opacity: {isRendered || true ? '1' : '0'}; 
    transition: opacity 0.1s ease-in-out;
  ">
   {#each items as item, i}
      {#if "separator" in item && item.separator}
         <li class="border-border-normal my-1 border-t-2" role="separator"></li>
      {:else}
         <li
            class="relative {item.children?.length ? 'has-submenu' : ''}"
            onmouseenter={() => onItemMouseEnter(i)}>
            <Button
               size="small"
               onclick={(event) => onItemClick(item, event)}
               role="menuitem"
               aria-haspopup={item.children?.length && showSubmenuIndicator
                  ? "true"
                  : undefined}
               aria-expanded={item.children?.length && item.expanded
                  ? "true"
                  : "false"}
               aria-checked={"checked" in item && item.checked !== undefined
                  ? item.checked
                     ? "true"
                     : "false"
                  : undefined}
               tabindex={i === activeIndex ? "0" : "-1"}
               cssClass="w-full flex items-center justify-between {item.class ||
                  ''} {activeIndex === i
                  ? 'bg-primary/10'
                  : ''} focus:outline-none">
               <div class="flex items-center">
                  {#if "icon" in item && item.icon}
                     <span class="mr-3">
                        <item.icon size="1.0625em" />
                     </span>
                  {/if}
                  <span>{item.label}</span>
               </div>
               <div class="ml-2 flex w-5 justify-center">
                  {#if "checked" in item && item.checked !== undefined}
                     {#if item.checked}
                        <Check size="1.0625em" />
                     {/if}
                  {:else if item.children?.length && showSubmenuIndicator}
                     <ChevronRight size="1.0625em" />
                  {/if}
               </div>
            </Button>
         </li>
      {/if}
   {/each}
</ul>
