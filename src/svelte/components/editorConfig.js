import Header from "@editorjs/header";
import List from "@editorjs/list";
import Code from "@editorjs/code";
import Image from "@editorjs/image";
import Table from "@editorjs/table";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import Embed from "@editorjs/embed";

export const editorConfig = {
  paragraph: {
    config: {
      preserveBlank: true,
    },
  },
  header: {
    class: Header,
    config: {
      levels: [1, 2, 3, 4, 5, 6],
      defaultLevel: 1,
    },
    inlineToolbar: ["link", "marker", "inlineCode"],
  },
  list: {
    class: List,
    inlineToolbar: ["link", "bold", "italic"], // Herramientas útiles dentro de listas
    config: {
      defaultStyle: "unordered",
      shortcut: "CMD+SHIFT+L", // Atajo rápido para listas
    },
  },
  code: {
    class: Code,
    config: {
      placeholder: "Enter code here...",
    },
  },
  image: {
    class: Image,
    config: {
      endpoints: {
        byFile: "unset",
        byUrl: "unset",
      },
    },
  },
  table: {
    class: Table,
    inlineToolbar: true,
    config: {
      rows: 2,
      cols: 3,
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
    config: {
      quotePlaceholder: "Enter a quote",
      captionPlaceholder: "Quote's author",
    },
  },
  marker: {
    class: Marker,
    shortcut: "CMD+SHIFT+M",
  },
  inlineCode: {
    class: InlineCode,
    shortcut: "CMD+SHIFT+C",
  },
  embed: {
    class: Embed,
    config: {
      services: {
        youtube: true,
        codesandbox: true,
        codepen: true,
      },
    },
  },
};