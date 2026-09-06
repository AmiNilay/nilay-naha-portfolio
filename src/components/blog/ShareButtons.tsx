"use client";

import { useState, useEffect } from "react";
import {
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  Check,
  MessageCircle,
} from "lucide-react";

interface ShareButtonsProps {
  title: string;
  slug?: string;
  description?: string;
  compact?: boolean;
}

export default function ShareButtons({
  title,
  slug = "",
  description = "",
  compact = false,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  // FIX: Always compute URL client-side to avoid SSR mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  // Recompute when slug changes (for SPA navigation)
  useEffect(() => {
    if (typeof window !== "undefined" && slug) {
      const url = `${window.location.origin}/blog/${slug}`;
      setCurrentUrl(url);
    }
  }, [slug]);

  const safeTitle = title || "Check out this article";
  const safeDescription = (description || "").slice(0, 200);
  const safeUrl = currentUrl || "";

  const encodedUrl = encodeURIComponent(safeUrl);
  const encodedTitle = encodeURIComponent(safeTitle);
  const encodedDescription = encodeURIComponent(safeDescription);

  const shareLinks = [
    {
      name: "Twitter / X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      hoverBg: "hover:bg-black hover:text-white hover:border-black",
      iconColor: "text-gray-700 dark:text-gray-300",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      hoverBg:
        "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]",
      iconColor: "text-[#1877F2]",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      hoverBg:
        "hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]",
      iconColor: "text-[#0A66C2]",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      hoverBg:
        "hover:bg-[#25D366] hover:text-white hover:border-[#25D366]",
      iconColor: "text-[#25D366]",
    },
  ];

  const copyLink = async () => {
    if (!safeUrl) return;
    try {
      await navigator.clipboard.writeText(safeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = safeUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: safeTitle,
        text: safeDescription,
        url: safeUrl,
      });
    } catch {
      // User cancelled
    }
  };

  // Don't render if URL is not ready yet
  if (!safeUrl) return null;

  // Compact layout (sidebar)
  if (compact) {
    return (
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Share2 className="w-3.5 h-3.5" /> Share
        </h3>
        <div className="flex flex-wrap gap-2">
          {shareLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                title={`Share on ${link.name}`}
                className={`w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all ${link.hoverBg}`}
              >
                <Icon className={`w-4 h-4 ${link.iconColor}`} />
              </a>
            );
          })}

          <button
            onClick={copyLink}
            title="Copy link"
            className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all ${
              copied
                ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-600"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    );
  }

  // Full layout (below content)
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
        <Share2 className="w-4 h-4" /> Share this article
      </h3>

      <div className="flex flex-wrap gap-3">
        {shareLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold transition-all ${link.iconColor} ${link.hoverBg}`}
            >
              <Icon className="w-4 h-4" />
              {link.name}
            </a>
          );
        })}

        <button
          onClick={copyLink}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
            copied
              ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" /> Copied
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4" /> Copy Link
            </>
          )}
        </button>

        {typeof navigator !== "undefined" && navigator.share && (
          <button
            onClick={handleNativeShare}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <Share2 className="w-4 h-4" /> More
          </button>
        )}
      </div>
    </div>
  );
}