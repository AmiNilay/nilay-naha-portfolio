"use client";
import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface ToastProps {
    message: string;
    type?: 'success' | 'error';
    onClose: () => void;
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-card border border-border px-4 py-3 rounded-lg shadow-lg animate-slide-up">
            {type === 'success' ? <CheckCircle className="text-emerald-500" size={20} /> : <XCircle className="text-red-500" size={20} />}
            <span className="text-sm font-medium">{message}</span>
            <button 
                onClick={onClose} 
                className="ml-2 text-muted-foreground hover:text-foreground"
                aria-label="Close notification"
            >
                <X size={16} />
            </button>
        </div>
    );
}