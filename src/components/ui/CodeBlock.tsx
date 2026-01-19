"use client";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
    language: string;
    code: string;
    title?: string;
}

export default function CodeBlock({ language, code, title }: CodeBlockProps) {
    return (
        <div className="rounded-lg overflow-hidden border border-border my-6 bg-[#1e1e1e]">
            {title && (
                <div className="bg-[#252526] px-4 py-2 text-xs text-gray-400 border-b border-[#333] flex items-center">
                    <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-4"></span>
                    <span className="font-mono">{title}</span>
                </div>
            )}
            <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '14px' }}
                wrapLines={true}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
}