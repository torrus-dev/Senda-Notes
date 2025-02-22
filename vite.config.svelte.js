import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "src/svelte"),
  plugins: [svelte(), tailwindcss()],
  base: "./",
  build: {
    outDir: path.resolve(__dirname, "output/dist"),
    assetsDir: ".",
    target: "esnext",
    minify: "esbuild",
    rollupOptions: {
      input: path.resolve(__dirname, "src/svelte/index.html"),
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
      treeshake: {
        moduleSideEffects: true,
      },
    },
  },
});
