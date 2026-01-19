"use client";
import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  // Auto-close after 3 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      role="alert" 
      className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border transition-all animate-in slide-in-from-right-10 fade-in duration-300 ${
        type === "success" 
          ? "bg-white dark:bg-gray-900 border-green-500 text-green-600" 
          : "bg-white dark:bg-gray-900 border-red-500 text-red-600"
      }`}
    >
      {type === "success" ? <CheckCircle size={24} /> : <XCircle size={24} />}
      <p className="font-bold text-gray-900 dark:text-white pr-4">{message}</p>
      
      {/* FIX: Added title and aria-label for accessibility */}
      <button 
        onClick={onClose} 
        title="Close Notification"
        aria-label="Close Notification"
        className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded-full text-gray-400"
      >
        <X size={18} />
      </button>
    </div>
  );
}