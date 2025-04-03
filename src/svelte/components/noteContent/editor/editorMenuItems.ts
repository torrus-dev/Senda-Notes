import {
   CopyIcon,
   ScissorsIcon,
   ClipboardPasteIcon,
   PenLineIcon,
   BoldIcon,
   ItalicIcon,
   StrikethroughIcon,
   CodeIcon,
   EraserIcon,
   ListOrderedIcon,
   ListIcon,
   Heading1Icon,
   Heading2Icon,
   Heading3Icon,
   Heading4Icon,
   Heading5Icon,
   Heading6Icon,
   TextIcon,
   QuoteIcon,
   SquareCodeIcon,
   MinusIcon,
   PilcrowIcon,
   BetweenHorizontalStartIcon,
   CheckSquareIcon,
   HighlighterIcon,
} from "lucide-svelte";
import type { Editor } from "@tiptap/core";
import type { MenuItem } from "@projectTypes/editorMenuTypes";

export function getFormatMenuItems(editor: Editor): MenuItem[] {
   if (!editor) return [];

   return [
      {
         type: "group",
         label: "Formato",
         icon: PenLineIcon,
         children: [
            {
               type: "action",
               label: "Negrita",
               icon: BoldIcon,
               checked: editor.isActive("bold"),
               action: () => editor.chain().focus().toggleBold().run(),
            },
            {
               type: "action",
               label: "Cursiva",
               icon: ItalicIcon,
               checked: editor.isActive("italic"),
               action: () => editor.chain().focus().toggleItalic().run(),
            },
            {
               type: "action",
               label: "Tachado",
               icon: StrikethroughIcon,
               checked: editor.isActive("strike"),
               action: () => editor.chain().focus().toggleStrike().run(),
            },
            { type: "separator" },
            {
               type: "action",
               label: "Código en línea",
               icon: CodeIcon,
               checked: editor.isActive("code"),
               action: () => editor.chain().focus().toggleCode().run(),
            },
            // Añadimos la opción de texto destacado
            {
               type: "action",
               label: "Destacar",
               icon: HighlighterIcon,
               checked: editor.isActive("highlight"),
               action: () => editor.chain().focus().toggleHighlight().run(),
            },
            { type: "separator" },
            {
               type: "action",
               label: "Limpiar formato",
               icon: EraserIcon,
               action: () =>
                  editor.chain().focus().unsetAllMarks().clearNodes().run(),
            },
         ],
      },
      {
         type: "group",
         label: "Lista",
         icon: ListIcon,
         children: [
            {
               type: "action",
               label: "Lista numerada",
               icon: ListOrderedIcon,
               checked: editor.isActive("orderedList"),
               action: () => editor.chain().focus().toggleOrderedList().run(),
            },
            {
               type: "action",
               label: "Lista normal",
               icon: ListIcon,
               checked: editor.isActive("bulletList"),
               action: () => editor.chain().focus().toggleBulletList().run(),
            },
            // Añadimos la opción de lista de tareas
            {
               type: "action",
               label: "Lista de tareas",
               icon: CheckSquareIcon,
               checked: editor.isActive("taskList"),
               action: () => editor.chain().focus().toggleTaskList().run(),
            },
         ],
      },
      {
         type: "group",
         label: "Párrafo",
         icon: PilcrowIcon,
         children: [
            {
               type: "action",
               label: "Título 1",
               icon: Heading1Icon,
               checked: editor.isActive("heading", { level: 1 }),
               action: () =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run(),
            },
            {
               type: "action",
               label: "Título 2",
               icon: Heading2Icon,
               checked: editor.isActive("heading", { level: 2 }),
               action: () =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run(),
            },
            {
               type: "action",
               label: "Título 3",
               icon: Heading3Icon,
               checked: editor.isActive("heading", { level: 3 }),
               action: () =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run(),
            },
            {
               type: "action",
               label: "Título 4",
               icon: Heading4Icon,
               checked: editor.isActive("heading", { level: 4 }),
               action: () =>
                  editor.chain().focus().toggleHeading({ level: 4 }).run(),
            },
            {
               type: "action",
               label: "Título 5",
               icon: Heading5Icon,
               checked: editor.isActive("heading", { level: 5 }),
               action: () =>
                  editor.chain().focus().toggleHeading({ level: 5 }).run(),
            },
            {
               type: "action",
               label: "Título 6",
               icon: Heading6Icon,
               checked: editor.isActive("heading", { level: 6 }),
               action: () =>
                  editor.chain().focus().toggleHeading({ level: 6 }).run(),
            },
            {
               type: "action",
               label: "Párrafo normal",
               icon: TextIcon,
               checked: editor.isActive("paragraph"),
               action: () => editor.chain().focus().setParagraph().run(),
            },
         ],
      },
      {
         type: "group",
         label: "Insertar",
         icon: BetweenHorizontalStartIcon,
         children: [
            {
               type: "action",
               label: "Bloque de código",
               icon: SquareCodeIcon,
               checked: editor.isActive("codeBlock"),
               action: () => editor.chain().focus().toggleCodeBlock().run(),
            },
            {
               type: "action",
               label: "Línea horizontal",
               icon: MinusIcon,
               action: () => editor.chain().focus().setHorizontalRule().run(),
            },
            {
               type: "action",
               label: "Cita",
               icon: QuoteIcon,
               checked: editor.isActive("blockquote"),
               action: () => editor.chain().focus().toggleBlockquote().run(),
            },
         ],
      },
      { type: "separator" },
      {
         type: "action",
         label: "Copiar",
         icon: CopyIcon,
         disabled: editor.state.selection.empty,
         action: async () => {
            const { from, to } = editor.state.selection;
            const selectedText = editor.state.doc.textBetween(from, to, " ");
            await navigator.clipboard.writeText(selectedText);
         },
      },
      {
         type: "action",
         label: "Cortar",
         icon: ScissorsIcon,
         disabled: editor.state.selection.empty,
         action: async () => {
            const { from, to } = editor.state.selection;
            const selectedText = editor.state.doc.textBetween(from, to, " ");
            await navigator.clipboard.writeText(selectedText);
            editor.chain().focus().deleteSelection().run();
         },
      },
      {
         type: "action",
         label: "Pegar",
         icon: ClipboardPasteIcon,
         action: async () => {
            const text = await navigator.clipboard.readText();
            if (text) {
               editor.chain().focus().insertContent(text).run();
            }
         },
      },
   ];
}
