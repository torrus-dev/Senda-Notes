import type { GlobalProperty } from "@projectTypes/propertyTypes";

interface GlobalPropertyUIStateOptions {
   isOpen: boolean;
   globalProperty?: GlobalProperty;
}

class GlobalPropertyState {
   private resetConfirmationState(): GlobalPropertyUIStateOptions {
      return {
         isOpen: false,
         globalProperty: undefined,
      };
   }

   private dialogState: GlobalPropertyUIStateOptions = $state(
      this.resetConfirmationState(),
   );

   getDialogState(): GlobalPropertyUIStateOptions {
      return this.dialogState;
   }

   // setDialogState(newDialogState: GlobalPropertyUIStateOptions) {
   //    this.dialogState = newDialogState;
   // }

   show(options: {
      title: string;
      message: string;
      variant?: "danger" | "warning" | "info";
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

export const globalConfirmationDialog = $state(new GlobalPropertyState());
