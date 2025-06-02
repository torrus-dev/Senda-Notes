import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
   root: path.resolve(__dirname, "src/svelte"),
   plugins: [svelte(), tailwindcss()],
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
