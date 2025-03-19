import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
} from "lucide-svelte";

import { isFormatActiveAt, applySmartCommand } from "./editorUtils.js";

/**
 * Crea los elementos de menú para formato de texto
 * @param {Object} editor - Instancia del editor TipTap
 * @param {Object} wordRange - Rango de palabra (opcional)
 * @returns {Array} - Array de elementos del menú
 */
export function createFormatMenuItems(editor, wordRange) {
  // Determinar el rango que se utilizará para verificar el estado
  const checkRange =
    wordRange && editor.state.selection.empty ? wordRange : null;

  return [
    {
      label: "Negrita",
      icon: Bold,
      checked: isFormatActiveAt(editor, "bold", null, checkRange),
      onClick: () =>
        applySmartCommand(editor, (chain) => chain.toggleBold(), wordRange),
    },
    {
      label: "Cursiva",
      icon: Italic,
      checked: isFormatActiveAt(editor, "italic", null, checkRange),
      onClick: () =>
        applySmartCommand(editor, (chain) => chain.toggleItalic(), wordRange),
    },
    { separator: true },
    {
      label: "Encabezado 1",
      icon: Heading1,
      checked: isFormatActiveAt(editor, "heading", { level: 1 }, checkRange),
      onClick: () =>
        applySmartCommand(
          editor,
          (chain) => chain.toggleHeading({ level: 1 }),
          wordRange,
        ),
    },
    {
      label: "Encabezado 2",
      icon: Heading2,
      checked: isFormatActiveAt(editor, "heading", { level: 2 }, checkRange),
      onClick: () =>
        applySmartCommand(
          editor,
          (chain) => chain.toggleHeading({ level: 2 }),
          wordRange,
        ),
    },
    {
      label: "Encabezado 3",
      icon: Heading3,
      checked: isFormatActiveAt(editor, "heading", { level: 3 }, checkRange),
      onClick: () =>
        applySmartCommand(
          editor,
          (chain) => chain.toggleHeading({ level: 3 }),
          wordRange,
        ),
    },
    { separator: true },
    {
      label: "Lista de viñetas",
      icon: List,
      checked: isFormatActiveAt(editor, "bulletList", null, checkRange),
      onClick: () =>
        applySmartCommand(
          editor,
          (chain) => chain.toggleBulletList(),
          wordRange,
        ),
    },
    {
      label: "Lista numerada",
      icon: ListOrdered,
      checked: isFormatActiveAt(editor, "orderedList", null, checkRange),
      onClick: () =>
        applySmartCommand(
          editor,
          (chain) => chain.toggleOrderedList(),
          wordRange,
        ),
    },
    { separator: true },
    {
      label: "Cita",
      icon: Quote,
      checked: isFormatActiveAt(editor, "blockquote", null, checkRange),
      onClick: () =>
        applySmartCommand(
          editor,
          (chain) => chain.toggleBlockquote(),
          wordRange,
        ),
    },
    {
      label: "Código",
      icon: Code,
      checked: isFormatActiveAt(editor, "codeBlock", null, checkRange),
      onClick: () =>
        applySmartCommand(
          editor,
          (chain) => chain.toggleCodeBlock(),
          wordRange,
        ),
    },
  ];
}
