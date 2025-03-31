<script>
let { menuItems } = $props();
</script>

{#if menuItems && menuItems.length > 0}
   <ul>
      {#each menuItems as menuItem, index}
         {#if "separator" in menuItem && menuItem.separator}
            <li class="border-border-normal my-1 border-t-2" role="separator">
            </li>
         {:else if ""}
            <li>{item.label}</li>
         {/if}
      {/each}
   </ul>
{/if}
