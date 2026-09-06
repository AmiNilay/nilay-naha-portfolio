"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Eye,
  Maximize,
  Minimize,
  RefreshCw,
  FolderGit2,
  AlertTriangle,
  Github,
  ExternalLink,
  Tag,
  Star,
} from "lucide-react";
import ReadingProgress from "@/components/blog/ReadingProgress";
import TableOfContents from "@/components/blog/TableOfContents";
import ShareButtons from "@/components/blog/ShareButtons";
import { sanitizeRichText, htmlToPlainText } from "@/lib/sanitizeRichText";

const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs = 12000,
) => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
};

export default function BlogPostClient() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  const [post, setPost] = useState<any>(null);
  const [linkedProject, setLinkedProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [viewCount, setViewCount] = useState<number>(0);
  const [headingsReady, setHeadingsReady] = useState(false);
  const [cleanContent, setCleanContent] = useState("");

  useEffect(() => {
    let cancelled = false;

    if (!slug) {
      setError("This post link is missing its slug.");
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      setPost(null);
      setLinkedProject(null);
      setHeadingsReady(false);
      setCleanContent("");

      try {
        const res = await fetchWithTimeout(
          `/api/blog?slug=${encodeURIComponent(slug)}`,
          { cache: "no-store" },
        );

        if (res.status === 404) {
          if (!cancelled) setPost(null);
          return;
        }
        if (!res.ok) throw new Error("Post request failed");

        const data = await res.json();
        if (!data.post) {
          if (!cancelled) setPost(null);
          return;
        }

        if (cancelled) return;
        setPost(data.post);
        setViewCount(data.post.views || 0);

        // Sanitize content for dark mode rendering
        const sanitized = sanitizeRichText(data.post.content || "");
        setCleanContent(sanitized);

        if (data.post.relatedProject) {
          fetchWithTimeout(
            `/api/projects?id=${encodeURIComponent(data.post.relatedProject)}`,
          )
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
              if (!cancelled && d?.project) setLinkedProject(d.project);
            })
            .catch(() => {});
        }

        fetchWithTimeout("/api/views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (!cancelled && d?.views) setViewCount(d.views);
          })
          .catch(() => {});
      } catch (fetchError) {
        console.error("Failed to fetch post:", fetchError);
        if (!cancelled) {
          const offline =
            typeof navigator !== "undefined" && !navigator.onLine;
          setError(
            offline
              ? "You appear to be offline. Please check your internet connection."
              : "This post is temporarily unavailable. Please try again.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPost();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Auto-assign IDs to headings for ToC
  useEffect(() => {
    if (!cleanContent) return;

    const timer = setTimeout(() => {
      const container = document.querySelector(".blog-content");
      if (!container) return;

      const headings = container.querySelectorAll(
        "h1, h2, h3, h4, h5, h6",
      );
      headings.forEach((el, i) => {
        const heading = el as HTMLElement;
        if (!heading.id) {
          const text = heading.textContent?.trim() || "";
          const generatedSlug = text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .replace(/\s+/g, "-")
            .replace(/(^-|-$)/g, "");
          heading.id = generatedSlug || `section-${i}`;
        }
        heading.style.scrollMarginTop = "120px";
      });

      setHeadingsReady(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [cleanContent]);

  // Add copy buttons to code blocks
  useEffect(() => {
    if (!cleanContent) return;

    const timer = setTimeout(() => {
      const preElements = document.querySelectorAll(".blog-content pre");
      preElements.forEach((preNode) => {
        const pre = preNode as HTMLElement;
        if (pre.querySelector(".code-toolbar")) return;

        pre.style.position = "relative";

        const toolbar = document.createElement("div");
        toolbar.className = "code-toolbar";
        toolbar.style.cssText =
          "position:absolute;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:8px 14px;z-index:10;";

        const codeEl = pre.querySelector("code");
        const langClass =
          codeEl?.className?.match(/language-(\w+)/)?.[1] || "";

        const left = document.createElement("div");
        if (langClass) {
          const langLabel = document.createElement("span");
          langLabel.style.cssText =
            "font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;font-family:monospace;";
          langLabel.textContent = langClass;
          left.appendChild(langLabel);
        }
        toolbar.appendChild(left);

        const button = document.createElement("button");
        button.style.cssText =
          "display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:#9ca3af;background:rgba(31,41,55,0.8);border:1px solid #374151;border-radius:6px;padding:4px 10px;cursor:pointer;backdrop-filter:blur(8px);transition:all 0.2s;font-family:inherit;";
        button.textContent = "Copy";

        button.addEventListener("click", async () => {
          const code = codeEl?.innerText || pre.innerText;
          await navigator.clipboard.writeText(code);
          button.textContent = "Copied";
          button.style.color = "#4ade80";
          button.style.borderColor = "rgba(74,222,128,0.4)";
          setTimeout(() => {
            button.textContent = "Copy";
            button.style.color = "#9ca3af";
            button.style.borderColor = "#374151";
          }, 2000);
        });

        toolbar.appendChild(button);
        pre.insertBefore(toolbar, pre.firstChild);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [cleanContent]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Unable to load post
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-white font-semibold"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Post Not Found
        </h1>
        <button
          onClick={() => router.push("/blog")}
          className="text-primary hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </button>
      </div>
    );
  }

  const publishedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const updatedDate = new Date(post.updatedAt);
  const formattedLastUpdated = `${updatedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at ${updatedDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;

  const projectDescription = linkedProject
    ? sanitizeRichText(linkedProject.description || "").replace(
        /<[^>]*>?/gm,
        "",
      )
    : "";

  const projectTags: string[] = linkedProject
    ? linkedProject.tags ||
      (typeof linkedProject.techStack === "string"
        ? linkedProject.techStack.split(",")
        : linkedProject.techStack) ||
      []
    : [];

  const plainExcerpt =
    post.excerpt || htmlToPlainText(post.content || "").slice(0, 200);

  return (
    <>
      <ReadingProgress />

      <article className="min-h-screen pt-24 pb-20 transition-colors duration-300">
        {/* Header */}
        <header className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 mb-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to all posts
          </Link>

          {post.category && (
            <div className="mb-6">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-full">
                {post.category}
              </span>
            </div>
          )}

          {post.featured && (
            <div className="mb-4 flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                <Star className="w-3 h-3 fill-current" /> Featured Article
              </span>
            </div>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 text-balance">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {publishedDate}
            </div>
            {post.readTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> {post.readTime} min read
              </div>
            )}
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Eye className="w-4 h-4" /> {viewCount} Views
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <RefreshCw className="w-3 h-3" /> Last updated:{" "}
            {formattedLastUpdated}
          </div>
        </header>

        {/* Cover Image */}
        {(post.coverImage || post.gDriveImage) && (
          <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-900"
            >
              <img
                src={post.coverImage || post.gDriveImage}
                alt={post.title}
                className="w-full h-full object-cover select-none"
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
                onError={(e) => {
                  if (
                    post.gDriveImage &&
                    e.currentTarget.src !== post.gDriveImage
                  ) {
                    e.currentTarget.src = post.gDriveImage;
                  }
                }}
              />
            </motion.div>
          </div>
        )}

        {/* Content + Sidebar */}
        <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-12 relative">
          {/* Main Content */}
          <div
            className={`flex-1 min-w-0 transition-all duration-500 ${
              focusMode ? "max-w-5xl mx-auto" : ""
            }`}
          >
            {/* Focus Mode Toggle */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setFocusMode(!focusMode)}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg"
              >
                {focusMode ? (
                  <>
                    <Minimize className="w-4 h-4" /> Exit Focus Mode
                  </>
                ) : (
                  <>
                    <Maximize className="w-4 h-4" /> Focus Mode
                  </>
                )}
              </button>
            </div>

            {/* Sanitized Blog Content */}
            <div
              className="blog-content prose prose-lg dark:prose-invert !max-w-none w-full"
              dangerouslySetInnerHTML={{ __html: cleanContent }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary transition-colors cursor-default"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share below content */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
              <ShareButtons
                title={post.title}
                slug={post.slug}
                description={plainExcerpt}
              />
            </div>
          </div>

          {/* Sticky Sidebar */}
          {!focusMode && (
            <aside className="hidden lg:block w-80 xl:w-96 shrink-0">
              <div className="sticky top-24 space-y-6">
                {headingsReady && (
                  <TableOfContents contentSelector=".blog-content" />
                )}

                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Written by
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                      NN
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        Nilay Naha
                      </p>
                      <p className="text-xs text-gray-500">
                        Software Developer
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Specializing in Python, FastAPI, and modern backend
                    systems.
                  </p>
                </div>

                {linkedProject && (
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-4">
                      <FolderGit2 className="w-4 h-4" /> Related Project
                    </div>

                    {(linkedProject.image ||
                      linkedProject.gDriveImage) && (
                      <Link
                        href={`/projects/${linkedProject.slug}`}
                        className="block w-full h-36 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4 group/thumb"
                      >
                        <img
                          src={
                            linkedProject.image ||
                            linkedProject.gDriveImage
                          }
                          alt={linkedProject.title}
                          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </Link>
                    )}

                    <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2">
                      {linkedProject.title}
                    </h4>

                    {projectDescription && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-4 leading-relaxed">
                        {projectDescription}
                      </p>
                    )}

                    {projectTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {projectTags
                          .slice(0, 5)
                          .map((tag: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/projects/${linkedProject.slug}`}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
                      >
                        View Project{" "}
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </Link>

                      <div className="flex gap-2">
                        {linkedProject.githubLink && (
                          <a
                            href={linkedProject.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl hover:border-gray-400 transition-colors"
                          >
                            <Github className="w-3.5 h-3.5" /> Code
                          </a>
                        )}
                        {linkedProject.liveLink && (
                          <a
                            href={linkedProject.liveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl hover:border-gray-400 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Live
                          </a>
                        )}
                        {linkedProject.appLink && (
                          <a
                            href={linkedProject.appLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-xl hover:bg-primary/20 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> App
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <ShareButtons
                    title={post.title}
                    slug={post.slug}
                    description={plainExcerpt}
                    compact
                  />
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
                  <Link
                    href="/blog"
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> All Articles
                  </Link>
                </div>
              </div>
            </aside>
          )}
        </div>
      </article>
    </>
  );
}