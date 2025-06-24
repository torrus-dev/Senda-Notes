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
         "@model": path.resolve(__dirname, "src/model"),
         "@directives": path.resolve(__dirname, "src/directives"),
         "@fonts": path.resolve(__dirname, "src/fonts"),
         "@components": path.resolve(__dirname, "src/svelte/components"),
         "@assets": path.resolve(__dirname, "src/svelte/assets"),
         "@i18n": path.resolve(__dirname, "src/i18n"),
         "@css": path.resolve(__dirname, "src/svelte/css"),
      },
   },
   build: {
      outDir: path.resolve(__dirname, "output/electron"),
      assetsDir: ".",
      target: "esnext",

      minify: "esbuild",
      resolve: {
         alias: {
            "@projectTypes": path.resolve(__dirname, "/types"),
            "@electron": path.resolve(__dirname, "/electron"),
            "@utils": path.resolve(__dirname, "/lib/utils"),
            "@controllers": path.resolve(__dirname, "/controllers"),
            "@model": path.resolve(__dirname, "src/model"),
            "@directives": path.resolve(__dirname, "/directives"),
            "@fonts": path.resolve(__dirname, "/fonts"),
            "@components": path.resolve(__dirname, "/svelte/components"),
            "@assets": path.resolve(__dirname, "src/svelte/assets"),
            "@i18n": path.resolve(__dirname, "/i18n"),
            "@css": path.resolve(__dirname, "/svelte/css"),
         },
      },
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
