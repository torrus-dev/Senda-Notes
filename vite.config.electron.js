import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    outDir: path.resolve(__dirname, "output/electron"),
    assetsDir: ".",
    target: "esnext",
    minify: "esbuild",
    rollupOptions: {
      input: path.resolve(__dirname, "src/electron/main.ts"),
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
      external: ["path", "fs", "electron"],
      treeshake: {
        moduleSideEffects: true,
      },
    },
  },
});
