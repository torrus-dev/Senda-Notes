import { defineConfig } from "vite";
import path from "path";
import { viteAlias } from "./appAlias";

export default defineConfig({
   base: "./",
   resolve: {
      alias: viteAlias,
   },
   build: {
      outDir: path.resolve(__dirname, "output/electron"),
      assetsDir: ".",
      target: "node22",
      ssr: true,
      minify: "esbuild",
      resolve: {
         alias: viteAlias,
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
      define: {
         "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      },
   },
});
