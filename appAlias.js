import path from "path";
export const viteAlias = {
   "@projectTypes": path.resolve(__dirname, "src/types"),
   "@electron": path.resolve(__dirname, "src/electron"),
   "@utils": path.resolve(__dirname, "src/lib/utils"),
   "@lib": path.resolve(__dirname, "src/lib"),
   "@controllers": path.resolve(__dirname, "src/controllers"),
   "@model": path.resolve(__dirname, "src/model"),
   "@directives": path.resolve(__dirname, "src/directives"),
   "@components": path.resolve(__dirname, "src/svelte/components"),
   "@assets": path.resolve(__dirname, "src/svelte/assets"),
   "@i18n": path.resolve(__dirname, "src/i18n"),
   "@css": path.resolve(__dirname, "src/svelte/css"),
};
