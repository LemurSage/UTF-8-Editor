"use client";

import { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Copy, Check } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";

type Format = "bold" | "italic";

type FormattedText = {
  text: string;
  formats: Format[];
};

const EditorPreviewComponent = () => {
  const [content, setContent] = useState<FormattedText[]>([]);
  const [copied, setCopied] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor }) => {
      const doc = editor.getJSON();
      const formattedContent: FormattedText[] = [];

      const processNode = (node: any) => {
        if (node.type === "text") {
          const formats: Format[] =
            node.marks
              ?.map((mark: any) => mark.type)
              .filter(
                (type: string): type is Format =>
                  type === "bold" || type === "italic"
              ) || [];
          formattedContent.push({ text: node.text, formats });
        } else if (node.type === "paragraph") {
          node.content?.forEach(processNode);
          formattedContent.push({ text: "\n", formats: [] });
        } else if (node.content) {
          node.content.forEach(processNode);
        }
      };

      doc.content?.forEach(processNode);
      setContent(formattedContent);
    },
  });

  const toggleFormat = useCallback(
    (format: Format) => {
      if (!editor) return;
      if (format === "bold") {
        editor.chain().focus().toggleBold().run();
      } else if (format === "italic") {
        editor.chain().focus().toggleItalic().run();
      }
    },
    [editor]
  );

  const applyUTF8Formatting = (text: string, formats: Format[]): string => {
    const formatMap: Record<string, number> = {
      boldUppercase: 0x1d400 - 65,
      boldLowercase: 0x1d41a - 97,
      boldNumbers: 0x1d7ce - 48,
      italicUppercase: 0x1d608 - 65,
      italicLowercase: 0x1d622 - 97,
      boldItalicUppercase: 0x1d468 - 65,
      boldItalicLowercase: 0x1d482 - 97,
    };

    return text
      .split("")
      .map((char) => {
        const code = char.codePointAt(0);
        if (!code) return char;

        let offset = 0;
        if (formats.includes("bold") && formats.includes("italic")) {
          if (code >= 65 && code <= 90) offset = formatMap.boldItalicUppercase;
          else if (code >= 97 && code <= 122)
            offset = formatMap.boldItalicLowercase;
          else if (code >= 48 && code <= 57) offset = formatMap.boldNumbers;
        } else if (formats.includes("bold")) {
          if (code >= 65 && code <= 90) offset = formatMap.boldUppercase;
          else if (code >= 97 && code <= 122) offset = formatMap.boldLowercase;
          else if (code >= 48 && code <= 57) offset = formatMap.boldNumbers;
        } else if (formats.includes("italic")) {
          if (code >= 65 && code <= 90) offset = formatMap.italicUppercase;
          else if (code >= 97 && code <= 122)
            offset = formatMap.italicLowercase;
        }

        return offset ? String.fromCodePoint(code + offset) : char;
      })
      .join("");
  };

  const renderPreview = () =>
    content.map((item, index) => (
      <span key={index}>
        {item.text === "\n" ? (
          <br />
        ) : (
          applyUTF8Formatting(item.text, item.formats)
        )}
      </span>
    ));

  const copyFormattedText = () => {
    navigator.clipboard.writeText(
      content
        .map((item) => applyUTF8Formatting(item.text, item.formats))
        .join("")
    );
    setCopied(true);
    toast.success("Text copied to clipboard! 🥳");

    setTimeout(() => {
      setCopied(false);
    }, 2000); // Reset after 2 seconds
  };

  return (
    <div className="flex flex-col h-screen bg-white text-black">
      <div className="flex items-center space-x-2 p-2 border-b">
        <ToggleGroup type="multiple">
          <ToggleGroupItem
            value="bold"
            aria-label="Toggle bold"
            onClick={() => toggleFormat("bold")}
          >
            <Bold className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="italic"
            aria-label="Toggle italic"
            onClick={() => toggleFormat("italic")}
          >
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        <button
          onClick={copyFormattedText}
          className="p-2 hover:bg-gray-200 rounded"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
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
