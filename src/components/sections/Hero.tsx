"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Github, Linkedin, Download } from "lucide-react";

export default function Hero() {
  const [data, setData] = useState({
    tagline: "Full Stack Engineer",
    headline: 'Building digital <br /> experiences that <span class="text-gray-500">matter.</span>',
    description: "I'm Nilay, a developer specializing in Python, Next.js, and AI integrations. I build accessible, pixel-perfect, and performant web applications.",
    image: "/images/profile.jpg"
  });
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/hero")
      .then((res) => res.json())
      .then((resData) => {
        // Only update if we actually got valid data from the DB
        if (resData && resData._id) {
          setData({
            tagline: resData.tagline || data.tagline,
            headline: resData.headline || data.headline,
            description: resData.description || data.description,
            image: resData.image || data.image
          });
        }
      })
      .catch((err) => console.error("Hero Fetch Error", err));
  }, []);

  // Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <section className="container mx-auto px-4 min-h-full flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 pt-28 md:pt-0">
      
      {/* --- LEFT SIDE: TEXT CONTENT --- */}
      <div className="flex-1 text-left space-y-6 md:space-y-8 animate-in fade-in slide-in-from-left-8 duration-700 order-2 md:order-1">
        
        <div className="inline-block">
          <span className="text-primary font-mono text-sm tracking-widest uppercase border-b border-primary/30 pb-1 font-bold">
            {data.tagline}
          </span>
        </div>

        {/* Dynamic HTML Headline */}
        <h1 
          className="text-4xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight"
          dangerouslySetInnerHTML={{ __html: data.headline }}
        />

        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-lg leading-relaxed font-medium">
          {data.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            href="/projects"
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            View Work <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="/resume.pdf"
            target="_blank"
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 font-semibold hover:border-primary hover:text-primary transition-colors"
          >
            Resume <Download className="w-4 h-4" />
          </a>

          <div className="flex items-center gap-5 ml-4 border-l pl-6 border-gray-300 dark:border-gray-700">
            <Link href="https://github.com/AmiNilay" target="_blank" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors transform hover:scale-110">
              <Github className="w-6 h-6" />
            </Link>
            <Link href="https://www.linkedin.com/in/nilay-naha/" target="_blank" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors transform hover:scale-110">
              <Linkedin className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: PROFILE PICTURE --- */}
      <div className="relative shrink-0 animate-in fade-in slide-in-from-right-8 duration-700 delay-200 order-1 md:order-2 mb-8 md:mb-0">
        <div className="relative w-48 h-48 md:w-80 md:h-80 rounded-full overflow-hidden border-[3px] md:border-4 border-white dark:border-gray-800 shadow-xl md:shadow-2xl ring-1 ring-gray-900/5 dark:ring-white/10 bg-gray-100 dark:bg-gray-900">
          <Image
            src={data.image}
            alt="Profile Picture"
            fill
            className="object-cover object-center"
            priority
            unoptimized // Ensures GitHub images load correctly
          />
        </div>
      </div>

    </section>
  );
}