"use client";

import { useState, useEffect } from "react";
import { BookOpen, Clock, Minimize2, Maximize2 } from "lucide-react";

interface BlogControlsProps {
  content: string; // Used to calculate read time
  onReadingModeChange: (isReadingMode: boolean) => void;
}

export default function BlogControls({ content, onReadingModeChange }: BlogControlsProps) {
  const [readTime, setReadTime] = useState(0);
  const [isReadingMode, setIsReadingMode] = useState(false);

  useEffect(() => {
    // 1. Calculate Read Time (Average 200 words per minute)
    const words = content.trim().split(/\s+/).length;
    const time = Math.ceil(words / 200);
    setReadTime(time);
  }, [content]);

  const toggleMode = () => {
    const newState = !isReadingMode;
    setIsReadingMode(newState);
    onReadingModeChange(newState);
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-800 mb-8">
      
      {/* Read Time */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Clock className="w-4 h-4" />
        <span>{readTime} min read</span>
      </div>

      {/* Reading Mode Toggle */}
      <button
        onClick={toggleMode}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
          ${isReadingMode 
            ? "bg-primary text-white shadow-lg scale-105" 
            : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"}
        `}
      >
        {isReadingMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        {isReadingMode ? "Exit Reading Mode" : "Reading Mode"}
      </button>
    </div>
  );
}