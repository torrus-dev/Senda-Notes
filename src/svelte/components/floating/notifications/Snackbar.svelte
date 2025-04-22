<script lang="ts">
import Button from "@components/utils/Button.svelte";
import type { Notification } from "@projectTypes/notificationsTypes";
import { XIcon } from "lucide-svelte";

let {
   notification,
   onDismiss,
}: { notification: Notification; onDismiss: () => void } = $props();
let { id, type, message, action } = notification;

const getSnackbarStyle = () => {
   switch (type) {
      case "error":
         return "bg-red-500/50";
      case "warning":
         return "bg-amber-500/50";
      case "success":
         return "bg-emerald-500/50";
      case "info":
         return "bg-blue-500/50";
      default:
         return "bg-base-300";
   }
};

// Estilo reactivo basado en el tipo
let snackbarStyle = $derived(getSnackbarStyle());
</script>

<div
   class="rounded-field flex items-center justify-between p-1 shadow {snackbarStyle}"
   id={id}>
   <div class="px-2.5">
      {message}
   </div>
   <div>
      {#if action}
         <Button size="small" class="bordered" onclick={action.onClick}>
            {action.label}
         </Button>
      {/if}
      <Button shape="square" onclick={onDismiss}
         ><XIcon size="1.125em" /></Button>
   </div>
</div>
