import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    outDir: path.resolve(__dirname, "output/electron/preload"),
    assetsDir: ".",
    target: "esnext",
    minify: "esbuild",
    rollupOptions: {
      input: path.resolve(__dirname, "src/electron/preload/preload.ts"),
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
        format: "cjs",
      },
      external: ["path", "fs", "electron"],
      treeshake: {
        moduleSideEffects: true,
      },
    },
  },
});
