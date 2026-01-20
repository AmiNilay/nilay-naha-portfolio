"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function AboutPreview() {
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data with cache-busting to ensure updates show immediately
    fetch(`/api/about?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.bio) {
          setBio(data.bio);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch about data", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-20 max-w-4xl text-center flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 max-w-4xl text-center py-20">
      <h2 className="text-4xl md:text-5xl font-bold mb-8">About Me</h2>
      
      {/* 🔴 MAGIC HAPPENS HERE: 
        dangerouslySetInnerHTML renders the HTML tags (<b>, <i>, <span>, <br>) 
        that you saved in the Admin Panel.
      */}
      <div 
        className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed space-y-4"
        dangerouslySetInnerHTML={{ __html: bio || "No biography available yet." }}
      />

      <div className="mt-10">
        <Link 
          href="/about" 
          className="px-8 py-3 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Read More About Me
        </Link>
      </div>
    </section>
  );
}