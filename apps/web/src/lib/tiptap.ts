import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Heading from "@tiptap/extension-heading";

export const tiptapExtensions = [
  StarterKit.configure({
    heading: false,
  }),
  Heading.configure({
    levels: [1, 2, 3],
  }),
  Placeholder.configure({
    placeholder: "Mulai menulis bab ini...",
  }),
  Underline,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
];
