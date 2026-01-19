"use client";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-background border border-border w-full max-w-lg rounded-lg shadow-lg relative p-6 m-4">
                <button 
                    onClick={onClose}
                    className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                    aria-label="Close modal"
                >
                    <X size={20} />
                </button>
                {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
                <div>{children}</div>
            </div>
        </div>
    );
}