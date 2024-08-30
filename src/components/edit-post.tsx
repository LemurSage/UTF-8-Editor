// components/EditPost.tsx
import { FC } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface EditPostProps {
  setContent: (content: string) => void;
}

const EditPost: FC<EditPostProps> = ({ setContent }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
    },
  });

  return (
    <div className="border border-gray-300 rounded p-4 bg-white shadow-sm h-full">
      <EditorContent editor={editor} />
    </div>
  );
};

export default EditPost;
