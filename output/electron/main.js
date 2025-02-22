import { app as e, BrowserWindow as i } from "electron";
import t from "path";
function n() {
  const o = new i({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: !1,
        contextIsolation: !0,
        webSecurity: !0,
        preload: t.join(
          process.cwd(),
          "output",
          "electron",
          "preload",
          "preload.js",
        ),
      },
    }),
    r = t.join(process.cwd(), "output", "dist", "index.html");
  o.loadFile(r), o.webContents.openDevTools();
}
e.whenReady().then(() => {
  n(),
    e.on("activate", function () {
      i.getAllWindows().length === 0 && n();
    });
});
e.on("window-all-closed", function () {
  process.platform !== "darwin" && e.quit();
});
