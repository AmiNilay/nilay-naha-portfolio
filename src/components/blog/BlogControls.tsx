"use client";

import { useState } from "react";
import { Clock, BookOpen, X } from "lucide-react";

interface BlogControlsProps {
  content: string;
  onReadingModeChange: (isReadingMode: boolean) => void;
}

export default function BlogControls({ content, onReadingModeChange }: BlogControlsProps) {
  const [isReadingMode, setIsReadingMode] = useState(false);

  const words = content.replace(/<[^>]+>/g, "").trim().split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(words / 200));

  const toggleMode = () => {
    const newState = !isReadingMode;
    setIsReadingMode(newState);
    onReadingModeChange(newState);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1.5 bg-gray-100/50 dark:bg-gray-800/50 rounded-full">
        <Clock className="w-3.5 h-3.5" />
        <span>{readTime} min read</span>
      </div>

      <button
        onClick={toggleMode}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
          isReadingMode
            ? "bg-primary text-white shadow-md"
            : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        }`}
      >
        {isReadingMode ? <X className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
        {isReadingMode ? "Exit" : "Focus Mode"}
      </button>
    </div>
  );
}