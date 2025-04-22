<!-- Notifications.svelte -->
<script lang="ts">
import Snackbar from "./Snackbar.svelte";
import { notificationController } from "@controllers/notificationController.svelte";
import { fly, fade } from "svelte/transition";
</script>

<div
   class="pointer-events-none fixed bottom-20 left-[calc(50%-14rem)] z-100 flex w-[28rem] flex-col gap-2">
   {#each notificationController.notifications as notification (notification.id)}
      <div
         in:fly={{ y: 50, duration: 300, opacity: 0 }}
         out:fly={{ y: 50, duration: 300, opacity: 0 }}
         class="pointer-events-auto">
         <Snackbar
            notification={notification}
            onDismiss={() =>
               notificationController.removeNotification(notification.id)} />
      </div>
   {/each}
</div>
