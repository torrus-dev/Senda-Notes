import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
   base: "./",
   resolve: {
      alias: {
         "@projectTypes": path.resolve(__dirname, "src/types"),
         "@electron": path.resolve(__dirname, "src/electron"),
         "@utils": path.resolve(__dirname, "src/lib/utils"),
         "@lib": path.resolve(__dirname, "src/lib"),
         "@controllers": path.resolve(__dirname, "src/controllers"),
         "@UIState": path.resolve(__dirname, "src/UIState"),
         "@model": path.resolve(__dirname, "src/model"),
         "@directives": path.resolve(__dirname, "src/directives"),
         "@fonts": path.resolve(__dirname, "src/fonts"),
         "@components": path.resolve(__dirname, "src/svelte/components"),
         "@i18n": path.resolve(__dirname, "src/i18n"),
         "@css": path.resolve(__dirname, "src/svelte/css"),
      },
   },
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
