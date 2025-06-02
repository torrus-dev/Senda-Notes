interface ConfirmationDialogOptions {
   isOpen: boolean;
   title?: string;
   message: string;
   variant: "danger" | "warning" | "info";
   onAccept: () => void;
   onCancel: () => void;
}

class ConfirmationController {
   private resetConfirmationState(): ConfirmationDialogOptions {
      return {
         isOpen: false,
         title: undefined,
         message: "",
         variant: "info",
         onAccept: () => {},
         onCancel: () => {},
      };
   }

   private dialogState: ConfirmationDialogOptions = $state(
      this.resetConfirmationState(),
   );

   getDialogState(): ConfirmationDialogOptions {
      return this.dialogState;
   }

   // setDialogState(newDialogState: ConfirmationDialogOptions) {
   //    this.dialogState = newDialogState;
   // }

   show(options: {
      title: string;
      message: string;
      variant?: ConfirmationDialogOptions["variant"];
      onAccept: () => void;
      onCancel?: () => void;
   }) {
      this.dialogState = {
         isOpen: true,
         title: options.title,
         message: options.message,
         variant: options.variant || "info",
         onAccept: options.onAccept,
         onCancel: options.onCancel || (() => {}),
      };
   }

   reset() {
      this.dialogState = this.resetConfirmationState();
   }

   accept() {
      this.dialogState.onAccept?.();
      this.reset();
   }

   close() {
      this.dialogState.onCancel?.();
      this.reset();
   }
}

export const globalConfirmationDialog = $state(new ConfirmationController());
