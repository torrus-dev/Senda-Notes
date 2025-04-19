<script lang="ts">
import { Snippet, tick } from "svelte";

let {
   isOpen,
   children,
   styles,
   htmlElement,
   placement,
}: {
   isOpen: boolean;
   children: Snippet;
   styles?: string;
   htmlElement: HTMLElement;
   placement?: "top" | "right" | "bottom" | "left";
} = $props();

$effect.root(() => {
   $effect(() => {
      if (isOpen) {
         tick().then(() => {
            //calcular posición con floatingUI
         });
      }
   });
});
</script>

{#if isOpen}
   <div class={styles}>
      {@render children()}
   </div>
{/if}
