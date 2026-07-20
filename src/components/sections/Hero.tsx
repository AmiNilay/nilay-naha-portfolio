"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Github, Linkedin, Download, Loader2, FileX } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function Hero() {
  const [data, setData] = useState({
    badge: "",
    title: "",
    subtitle: "",
    profilePic: "",
    resumeUrl: "",
    socialGithub: "",
    socialLinkedin: "",
  });

  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cursor parallax motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation
  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Transform mouse position → subtle image movement
  const imageX = useTransform(springX, [-0.5, 0.5], [-25, 25]);
  const imageY = useTransform(springY, [-0.5, 0.5], [-25, 25]);

  // Reverse parallax for glow ring
  const glowX = useTransform(springX, [-0.5, 0.5], [15, -15]);
  const glowY = useTransform(springY, [-0.5, 0.5], [15, -15]);

  useEffect(() => {
    fetch(`/api/hero?timestamp=${Date.now()}`, {
      cache: "no-store",
      headers: { Pragma: "no-cache" },
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
            socialLinkedin: resData.socialLinkedin || "",
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Hero Fetch Error", err);
        setLoading(false);
      });
  }, []);

  // Track mouse position for parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  if (loading) {
    return (
      <section className="h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </section>
    );
  }

  const imageKey = data.profilePic ? `${data.profilePic}?v=${Date.now()}` : null;

  const easeOut = [0.25, 0.4, 0.25, 1] as const;

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="container mx-auto px-6 max-w-7xl min-h-[90vh] flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16 lg:gap-24 pt-24 md:pt-0 pb-20 md:pb-0"
    >

      {/* TEXT CONTENT */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: easeOut }}
        className="flex-1 md:basis-3/5 text-left space-y-6 order-2 md:order-1 max-w-3xl"
      >
        {data.badge && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block"
          >
            <span
              className="text-primary font-mono text-xs md:text-sm tracking-widest uppercase border-b border-primary/30 pb-1 font-bold"
              dangerouslySetInnerHTML={{ __html: data.badge }}
            />
          </motion.div>
        )}

        {data.title ? (
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: easeOut }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1] text-balance"
            dangerouslySetInnerHTML={{ __html: data.title }}
          />
        ) : (
          <h1 className="text-4xl font-bold text-gray-300">Welcome</h1>
        )}

        {data.subtitle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7, ease: easeOut }}
            className="text-base md:text-xl text-gray-700 dark:text-gray-300 max-w-lg leading-relaxed font-medium"
            dangerouslySetInnerHTML={{ __html: data.subtitle }}
          />
        )}

        {/* BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7, ease: easeOut }}
          className="flex flex-wrap items-center gap-4 pt-4"
        >
          <Link
            href="/projects"
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-full shadow-lg hover:opacity-90 hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 text-sm md:text-base"
          >
            View Work <ArrowRight className="w-4 h-4" />
          </Link>

          {data.resumeUrl ? (
            <a
              href={data.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-full text-gray-800 dark:text-gray-200 font-semibold hover:border-primary hover:text-primary hover:-translate-y-0.5 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-sm md:text-base"
            >
              Resume <Download className="w-4 h-4" />
            </a>
          ) : (
            <button
              disabled
              className="flex items-center gap-2 px-6 py-3 border-2 border-red-200 text-red-400 rounded-lg cursor-not-allowed opacity-50"
            >
              No Resume <FileX className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-5 ml-2 md:ml-4 border-l pl-4 md:pl-6 border-gray-300 dark:border-gray-700">
            {data.socialGithub && (
              <Link
                href={data.socialGithub}
                target="_blank"
                className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all duration-200 hover:scale-125 hover:-translate-y-0.5"
              >
                <Github className="w-5 h-5 md:w-6 md:h-6" />
              </Link>
            )}
            {data.socialLinkedin && (
              <Link
                href={data.socialLinkedin}
                target="_blank"
                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-all duration-200 hover:scale-125 hover:-translate-y-0.5"
              >
                <Linkedin className="w-5 h-5 md:w-6 md:h-6" />
              </Link>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* PROFILE PICTURE with CURSOR PARALLAX */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: 40 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.8, ease: easeOut, delay: 0.2 }}
        className="relative shrink-0 order-1 md:order-2"
        style={{ perspective: 1000 }}
      >
        {/* Animated background glow ring (reverse parallax) */}
        <motion.div
          style={{ x: glowX, y: glowY }}
          className="absolute inset-0 -z-10 blur-3xl opacity-40 dark:opacity-60"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary via-purple-500 to-pink-500" />
        </motion.div>

        {/* Floating profile picture (follows cursor subtly) */}
        <motion.div
          style={{ x: imageX, y: imageY }}
          className="relative w-40 h-40 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-[4px] border-white dark:border-gray-800 shadow-2xl ring-1 ring-gray-900/5 dark:ring-white/10 bg-gray-100 dark:bg-gray-900"
        >
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
        </motion.div>

        {/* Floating decoration dots */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-4 -right-4 w-6 h-6 rounded-full bg-primary/80 shadow-lg"
        />
        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-2 -left-4 w-4 h-4 rounded-full bg-purple-500/70 shadow-lg"
        />
      </motion.div>
    </section>
  );
}