"use client";

import React, { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { LuBold, LuItalic, LuCopy } from "react-icons/lu";

interface FormattedText {
  text: string;
  formats: ("bold" | "italic")[];
}

const EditorPreviewComponent = () => {
  const [content, setContent] = useState<FormattedText[]>([
    { text: "", formats: [] },
  ]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor }) => {
      const doc = editor.getJSON();
      const formattedContent: FormattedText[] = [];

      const processNode = (node: any) => {
        if (node.type === "text") {
          const formats: ("bold" | "italic")[] = [];
          if (node.marks) {
            node.marks.forEach((mark: any) => {
              if (mark.type === "bold") formats.push("bold");
              if (mark.type === "italic") formats.push("italic");
            });
          }
          formattedContent.push({ text: node.text, formats });
        } else if (node.content) {
          node.content.forEach(processNode);
        }
      };

      if (doc.content) {
        doc.content.forEach(processNode);
      }
      setContent(formattedContent);
    },
  });

  const toggleFormat = useCallback(
    (format: "bold" | "italic") => {
      if (!editor) return;
      switch (format) {
        case "bold":
          editor.chain().focus().toggleBold().run();
          break;
        case "italic":
          editor.chain().focus().toggleItalic().run();
          break;
      }
    },
    [editor]
  );

  const applyUTF8Formatting = (text: string, formats: string[]): string => {
    let result = text;
    if (formats.includes("bold") && formats.includes("italic")) {
      result = result
        .split("")
        .map((char) => {
          const codePoint = char.codePointAt(0);
          if (codePoint) {
            if (codePoint >= 65 && codePoint <= 90) {
              // Uppercase A-Z
              return String.fromCodePoint(codePoint + 0x1d468 - 65);
            } else if (codePoint >= 97 && codePoint <= 122) {
              // Lowercase a-z
              return String.fromCodePoint(codePoint + 0x1d482 - 97);
            }
          }
          return char;
        })
        .join("");
    } else if (formats.includes("bold")) {
      result = result
        .split("")
        .map((char) => {
          const codePoint = char.codePointAt(0);
          if (codePoint) {
            if (codePoint >= 65 && codePoint <= 90) {
              // Uppercase A-Z
              return String.fromCodePoint(codePoint + 0x1d400 - 65);
            } else if (codePoint >= 97 && codePoint <= 122) {
              // Lowercase a-z
              return String.fromCodePoint(codePoint + 0x1d41a - 97);
            }
          }
          return char;
        })
        .join("");
    } else if (formats.includes("italic")) {
      result = result
        .split("")
        .map((char) => {
          const codePoint = char.codePointAt(0);
          if (codePoint) {
            if (codePoint >= 65 && codePoint <= 90) {
              // Uppercase A-Z
              return String.fromCodePoint(codePoint + 0x1d608 - 65);
            } else if (codePoint >= 97 && codePoint <= 122) {
              // Lowercase a-z
              return String.fromCodePoint(codePoint + 0x1d622 - 97);
            }
          }
          return char;
        })
        .join("");
    }
    return result;
  };

  const renderPreview = () => {
    return content.map((item, index) => (
      <span key={index}>
        {applyUTF8Formatting(item.text, item.formats)}
      </span>
    ));
  };

  const copyFormattedText = () => {
    const formattedText = content
      .map((item) => applyUTF8Formatting(item.text, item.formats))
      .join("");
    navigator.clipboard.writeText(formattedText);
  };

  return (
    <div className="flex flex-col h-screen bg-white text-black">
      <div className="flex space-x-2 p-2 border-b">
        <button
          onClick={() => toggleFormat("bold")}
          className="p-2 hover:bg-gray-200 rounded"
        >
          <LuBold size={20} />
        </button>
        <button
          onClick={() => toggleFormat("italic")}
          className="p-2 hover:bg-gray-200 rounded"
        >
          <LuItalic size={20} />
        </button>
        <button
          onClick={copyFormattedText}
          className="p-2 hover:bg-gray-200 rounded"
        >
          <LuCopy size={20} />
        </button>
      </div>
      <div className="flex flex-1">
        <div className="w-1/2 p-4 border-r">
          <h2 className="text-xl font-bold mb-4">Editor</h2>
          <EditorContent editor={editor} className="prose max-w-none" />
        </div>
        <div className="w-1/2 p-4">
          <h2 className="text-xl font-bold mb-4">Preview</h2>
          <div className="prose max-w-none">{renderPreview()}</div>
        </div>
      </div>
    </div>
  );
};

export default EditorPreviewComponent;
