class SettingsController {
  showToolbar = $state<boolean>(false);
  theme = $state<"light" | "dark">("dark");
  sidebarIsLocked = $state<boolean>(false);

  toggleThemeMode = () => {
    if (this.theme === "light") {
      this.theme = "dark";
    } else if (this.theme === "dark") {
      this.theme = "light";
    }
  };
  toggleLockSidebar = () => {
    this.sidebarIsLocked = !this.sidebarIsLocked;
  };
}

export const settingsController = $state(new SettingsController());
