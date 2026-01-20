"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Github, Linkedin, Download, Loader2, FileX } from "lucide-react";

export default function Hero() {
  const [data, setData] = useState({
    badge: "",
    title: "",
    subtitle: "",
    profilePic: "", 
    resumeUrl: "",
    socialGithub: "",
    socialLinkedin: ""
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/hero?timestamp=${Date.now()}`, { 
      cache: "no-store", 
      headers: { "Pragma": "no-cache" } 
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData) {
          setData({
            badge: resData.badge || resData.tagline || "",
            title: resData.title || resData.headline || "",
            subtitle: resData.subtitle || resData.description || "",
            profilePic: resData.profilePic || resData.image || "", 
            resumeUrl: resData.resumeUrl || "",
            socialGithub: resData.socialGithub || "",
            socialLinkedin: resData.socialLinkedin || ""
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Hero Fetch Error", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <section className="h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></section>;
  }

  const imageKey = data.profilePic ? `${data.profilePic}?v=${Date.now()}` : null;

  return (
    <section className="container mx-auto px-6 max-w-7xl min-h-[90vh] flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16 lg:gap-24 pt-24 md:pt-0 pb-20 md:pb-0">
      
      {/* TEXT CONTENT */}
      {/* 🟢 UPDATED: Changed 'max-w-2xl' to 'max-w-3xl' and added 'md:basis-3/5' to give text more width priority */}
      <div className="flex-1 md:basis-3/5 text-left space-y-6 animate-in fade-in slide-in-from-left-8 duration-700 order-2 md:order-1 max-w-3xl">
        
        {data.badge && (
          <div className="inline-block">
            <span 
              className="text-primary font-mono text-xs md:text-sm tracking-widest uppercase border-b border-primary/30 pb-1 font-bold"
              dangerouslySetInnerHTML={{ __html: data.badge }} 
            />
          </div>
        )}

        {data.title ? (
          <h1 
            // 🟢 UPDATED: Adjusted sizes. lg:text-7xl might be too big for some laptops, changed to lg:text-6xl/xl-text-7xl logic if needed, 
            // but widening the container (above) is the real fix.
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1] text-balance"
            dangerouslySetInnerHTML={{ __html: data.title }}
          />
        ) : (
          <h1 className="text-4xl font-bold text-gray-300">Welcome</h1>
        )}

        {data.subtitle && (
          <div 
            className="text-base md:text-xl text-gray-700 dark:text-gray-300 max-w-lg leading-relaxed font-medium"
            dangerouslySetInnerHTML={{ __html: data.subtitle }}
          />
        )}

        {/* BUTTONS */}
        <div className="flex flex-wrap items-center gap-4 pt-4">
          <Link 
            href="/projects" 
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-full shadow-lg hover:opacity-90 hover:scale-105 transition-all text-sm md:text-base"
          >
            View Work <ArrowRight className="w-4 h-4" />
          </Link>

          {data.resumeUrl ? (
            <a
              href={data.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-full text-gray-800 dark:text-gray-200 font-semibold hover:border-primary hover:text-primary transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 text-sm md:text-base"
            >
              Resume <Download className="w-4 h-4" />
            </a>
          ) : (
            <button disabled className="flex items-center gap-2 px-6 py-3 border-2 border-red-200 text-red-400 rounded-lg cursor-not-allowed opacity-50">
              No Resume <FileX className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-5 ml-2 md:ml-4 border-l pl-4 md:pl-6 border-gray-300 dark:border-gray-700">
            {data.socialGithub && (
              <Link href={data.socialGithub} target="_blank" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors transform hover:scale-110">
                <Github className="w-5 h-5 md:w-6 md:h-6" />
              </Link>
            )}
            {data.socialLinkedin && (
              <Link href={data.socialLinkedin} target="_blank" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors transform hover:scale-110">
                <Linkedin className="w-5 h-5 md:w-6 md:h-6" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* PROFILE PICTURE */}
      <div className="relative shrink-0 animate-in fade-in slide-in-from-right-8 duration-700 delay-200 order-1 md:order-2">
        <div className="relative w-40 h-40 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-[4px] border-white dark:border-gray-800 shadow-2xl ring-1 ring-gray-900/5 dark:ring-white/10 bg-gray-100 dark:bg-gray-900">
          {data.profilePic ? (
            <Image
              key={imageKey} 
              src={data.profilePic} 
              alt="Profile Picture"
              fill
              className="object-cover object-center"
              priority
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-400">
              <span className="text-xs">No Image</span>
            </div>
          )}
        </div>
      </div>

    </section>
  );
}