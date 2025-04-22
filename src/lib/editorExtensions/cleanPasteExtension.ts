// cleanPasteExtension.ts
import { Extension } from "@tiptap/core";
import { Plugin } from "prosemirror-state";

/**
 * Extensión TipTap que limpia el texto pegado eliminando líneas vacías excesivas
 */
export const CleanPasteExtension = Extension.create({
   name: "cleanPaste",

   addProseMirrorPlugins() {
      return [
         new Plugin({
            props: {
               handlePaste: (view, event) => {
                  // Obtener el texto plano del portapapeles
                  const text = event.clipboardData?.getData("text/plain");

                  if (text) {
                     // Limpiar el texto: reemplazar múltiples saltos de línea consecutivos con máximo dos
                     const cleanedText = text.replace(/\n{3,}/g, "\n\n");

                     // Insertar el texto limpio en la posición del cursor
                     const { tr } = view.state;
                     view.dispatch(tr.insertText(cleanedText));

                     // Prevenir el comportamiento predeterminado
                     event.preventDefault();
                     return true;
                  }

                  return false;
               },
            },
         }),
      ];
   },
});
