declare module "*.svelte" {
   export { SvelteComponentDev as default } from "svelte/internal";
}

// Declaraciones para assets de audio
declare module "*.wav" {
   const src: string;
   export default src;
}

declare module "*.mp3" {
   const src: string;
   export default src;
}

declare module "*.ogg" {
   const src: string;
   export default src;
}

// Otros assets si los necesitas
declare module "*.png" {
   const src: string;
   export default src;
}

declare module "*.jpg" {
   const src: string;
   export default src;
}

declare module "*.jpeg" {
   const src: string;
   export default src;
}

declare module "*.gif" {
   const src: string;
   export default src;
}

declare module "*.svg" {
   const src: string;
   export default src;
}

declare module "*.webp" {
   const src: string;
   export default src;
}
