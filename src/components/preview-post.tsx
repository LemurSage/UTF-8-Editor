// components/PreviewPost.tsx
import { FC } from "react";

interface PreviewPostProps {
  content: string;
}

const PreviewPost: FC<PreviewPostProps> = ({ content }) => {
  return (
    <div
      className="border border-gray-300 rounded p-4 bg-white shadow-sm h-full"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default PreviewPost;
