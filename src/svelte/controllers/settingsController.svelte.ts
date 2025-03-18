class SettingsController {
  showToolbar = $state<boolean>(false);
}

export const settingsController = $state(new SettingsController());
