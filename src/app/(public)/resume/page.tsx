"use client";
import { Button } from "@/components/ui/Button";
import { Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ResumePage() {
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">My Resume</h1>
                <div className="flex gap-4">
                    <Link href="/">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft size={16} /> Back
                        </Button>
                    </Link>
                    <a href="/resume.pdf" download="Nilay_Naha_Resume.pdf">
                        <Button className="gap-2">
                            <Download size={16} /> Download PDF
                        </Button>
                    </a>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 w-full bg-muted rounded-lg overflow-hidden border border-border shadow-sm">
                <iframe
                    src="/resume.pdf"
                    className="w-full h-full"
                    title="Resume PDF"
                />
            </div>
            
            <p className="text-center text-sm text-muted-foreground mt-4 sm:hidden">
                Tap the "Download PDF" button to view the full resume on mobile.
            </p>
        </div>
    );
}