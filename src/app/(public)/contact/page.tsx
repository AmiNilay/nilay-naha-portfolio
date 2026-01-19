"use client";

import Link from "next/link";
import { Mail, Linkedin, Github, Check, Copy } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const email = "niloynaha2003@gmail.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    // Reset after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen flex flex-col items-center justify-center relative">
      
      {/* TOAST NOTIFICATION - Floating Top Center */}
      <div 
        className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-foreground text-background rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 ${
          copied ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-green-500 rounded-full p-1">
          <Check className="w-3 h-3 text-white" />
        </div>
        <span className="font-semibold text-sm">Email Copied!</span>
      </div>

      <div className="max-w-4xl w-full text-center">
        
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
          I'm always open to discussing new projects, creative ideas, or opportunities.
        </p>

        <div className="grid gap-8 md:grid-cols-3">

          {/* 1. Email Card - CLICK TO COPY */}
          <button
            onClick={handleCopy}
            className="group relative flex flex-col items-center p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-primary/50 hover:shadow-2xl transition-all duration-300 cursor-pointer w-full"
          >
            <div className="p-4 bg-primary/10 rounded-full mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              {copied ? <Check className="w-8 h-8" /> : <Mail className="w-8 h-8 text-primary group-hover:text-white" />}
            </div>
            <h3 className="text-xl font-bold mb-2">Email</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm break-all">
              {email}
            </p>
            
            {/* Hover Hint */}
            <span className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-primary font-medium flex items-center gap-1">
              <Copy className="w-3 h-3" /> Copy
            </span>
          </button>

          {/* 2. LinkedIn Card */}
          <Link
            href="https://www.linkedin.com/in/nilay-naha/"
            target="_blank"
            className="group flex flex-col items-center p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-primary/50 hover:shadow-2xl transition-all duration-300"
          >
            <div className="p-4 bg-primary/10 rounded-full mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <Linkedin className="w-8 h-8 text-primary group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">LinkedIn</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Connect with me</p>
          </Link>

          {/* 3. GitHub Card */}
          <Link
            href="https://github.com/AmiNilay"
            target="_blank"
            className="group flex flex-col items-center p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-primary/50 hover:shadow-2xl transition-all duration-300"
          >
            <div className="p-4 bg-primary/10 rounded-full mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <Github className="w-8 h-8 text-primary group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">GitHub</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Check out my code</p>
          </Link>

        </div>
      </div>
    </div>
  );
}