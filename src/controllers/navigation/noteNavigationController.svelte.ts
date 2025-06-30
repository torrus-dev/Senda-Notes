import { workspaceModel } from "@model/navigation/workspaceModel.svelte";

class WorkspaceController {
   get activeNoteId(): string | undefined {
      return workspaceModel.data.activeNoteId;
   }

   set activeNoteId(newId: string) {
      workspaceModel.data.activeNoteId = newId;
   }

   unsetActiveNoteId() {
      workspaceModel.data.activeNoteId = undefined;
   }
}

export const workspaceController = $state(new WorkspaceController());
