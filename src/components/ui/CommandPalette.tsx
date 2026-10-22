"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Home, FolderGit2, FileText, User, Mail, 
  Moon, Sun, Command, ArrowRight, Sparkles, Loader2, Briefcase
} from "lucide-react";
import { loadModel, semanticRank, type SearchItem } from "@/lib/semanticSearch";

interface Blog {
  title: string;
  slug: string;
  excerpt?: string;
  tags?: string[];
  published?: boolean;
}

interface ProjectLite {
  title: string;
  slug: string;
  description?: string;
  tags?: string[];
  status?: string;
}

type SmartStatus = "off" | "loading" | "ready" | "error";

// Page descriptions give smart search something to match meaning against.
const PAGE_ITEMS: SearchItem[] = [
  { id: "page:/", kind: "page", url: "/", title: "Home", text: "Introduction, profile, tech stack and résumé" },
  { id: "page:/projects", kind: "page", url: "/projects", title: "Projects", text: "Portfolio of apps and software built" },
  { id: "page:/blog", kind: "page", url: "/blog", title: "Blog", text: "Articles and technical writing" },
  { id: "page:/about", kind: "page", url: "/about", title: "About", text: "Experience, education, skills, certifications and recommendations" },
  { id: "page:/contact", kind: "page", url: "/contact", title: "Contact", text: "Email, LinkedIn, hire, get in touch, message" },
  { id: "page:/match", kind: "page", url: "/match", title: "Job Match", text: "Recruiters: compare a job description with his skills and get a tailored résumé" },
];

const strip = (s?: string) =>
  (s || "").replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [smart, setSmart] = useState<SmartStatus>("off");
  const [progress, setProgress] = useState(0);
  const [smartResults, setSmartResults] = useState<SearchItem[] | null>(null);
  const [ranking, setRanking] = useState(false);
  const router = useRouter();

  // Listen for Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch blogs for dynamic search when palette opens
  useEffect(() => {
    if (isOpen && blogs.length === 0) {
      fetch("/api/blog")
        .then((res) => res.json())
        .then((data) => {
          if (data.posts) setBlogs(data.posts.filter((p: Blog) => p.published !== false));
        })
        .catch((err) => console.error("Failed to fetch blogs for palette", err));
    }
  }, [isOpen, blogs.length]);

  const items = useMemo<SearchItem[]>(
    () => [
      ...PAGE_ITEMS,
      ...projects
        .filter((p) => !/draft/i.test(p.status || ""))
        .map((p) => ({
          id: `project:${p.slug}`, kind: "project" as const, url: `/projects/${p.slug}`, title: p.title,
          text: `${(p.tags || []).join(", ")}. ${strip(p.description).slice(0, 600)}`,
        })),
      ...blogs.map((b) => ({
        id: `post:${b.slug}`, kind: "post" as const, url: `/blog/${b.slug}`, title: b.title,
        text: `${(b.tags || []).join(", ")}. ${b.excerpt || ""}`,
      })),
    ],
    [projects, blogs]
  );

  // Opt-in smart search: the on-device model is downloaded only when asked.
  const toggleSmart = async () => {
    if (smart === "ready" || smart === "loading") {
      setSmart("off");
      setSmartResults(null);
      return;
    }
    setSmart("loading");
    setProgress(0);
    try {
      if (!projects.length) {
        const data = await fetch("/api/projects").then((r) => r.json()).catch(() => ({}));
        if (data.projects) setProjects(data.projects);
      }
      await loadModel(setProgress);
      setSmart("ready");
    } catch (err) {
      console.error("Smart search unavailable", err);
      setSmart("error");
    }
  };

  // Rank by meaning (debounced); keyword results below remain as the fallback.
  useEffect(() => {
    if (smart !== "ready" || query.trim().length < 3) {
      setSmartResults(null);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setRanking(true);
      try {
        const ranked = await semanticRank(query, items, 6);
        if (!cancelled) setSmartResults(ranked.map((r) => r.item));
      } catch {
        if (!cancelled) setSmartResults(null);
      } finally {
        if (!cancelled) setRanking(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, smart, items]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [isOpen]);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsOpen(false);
  };

  const navigateTo = (path: string) => {
    router.push(path);
    setIsOpen(false);
    setQuery("");
  };

  // Define static actions
  const staticActions = [
    { id: "home", name: "Home", icon: Home, action: () => navigateTo("/") },
    { id: "projects", name: "Projects", icon: FolderGit2, action: () => navigateTo("/projects") },
    { id: "blog", name: "Blog", icon: FileText, action: () => navigateTo("/blog") },
    { id: "about", name: "About", icon: User, action: () => navigateTo("/about") },
    { id: "contact", name: "Contact", icon: Mail, action: () => navigateTo("/contact") },
    { id: "match", name: "Job Match (for recruiters)", icon: Briefcase, action: () => navigateTo("/match") },
    { id: "theme", name: "Toggle Dark/Light Mode", icon: Moon, action: toggleTheme },
  ];

  // Filter actions and blogs based on search query
  const filteredActions = staticActions.filter((action) =>
    action.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[999] bg-gray-900/50 backdrop-blur-sm"
          />

          {/* Palette Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[1000] w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center px-4 py-4 border-b border-gray-200 dark:border-gray-800">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 text-lg"
              />
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-500 dark:text-gray-400 font-mono">
                <Command className="w-3 h-3" /> ESC
              </div>
            </div>

            {/* Smart search toggle */}
            <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-gray-200 dark:border-gray-800 text-xs">
              <button
                onClick={toggleSmart}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold transition-colors ${
                  smart === "ready"
                    ? "bg-violet-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {smart === "loading" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Smart search (AI, on-device)
              </button>
              <span className="text-gray-400 truncate">
                {smart === "loading" && `Downloading model… ${progress}%`}
                {smart === "ready" && (ranking ? "Thinking…" : "Searches by meaning")}
                {smart === "error" && "Couldn't load — using keyword search"}
                {smart === "off" && "Free · runs in your browser"}
              </span>
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {/* Smart (semantic) results */}
              {smartResults && smartResults.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-xs font-semibold text-violet-500 uppercase tracking-wider">
                    Best matches by meaning
                  </div>
                  {smartResults.map((item) => {
                    const Icon = item.kind === "project" ? FolderGit2 : item.kind === "post" ? FileText : Search;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigateTo(item.url)}
                        className="w-full flex items-center px-3 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors group"
                      >
                        <Icon className="w-5 h-5 mr-3 text-violet-400" />
                        <span className="flex-1 min-w-0">
                          <span className="block font-medium truncate">{item.title}</span>
                          <span className="block text-xs text-gray-400 truncate">{item.text}</span>
                        </span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Navigation & Actions */}
              {filteredActions.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Navigation & Actions
                  </div>
                  {filteredActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="w-full flex items-center px-3 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors group"
                    >
                      <action.icon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-primary transition-colors" />
                      <span className="flex-1 font-medium">{action.name}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              {/* Blog Posts */}
              {filteredBlogs.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Blog Posts
                  </div>
                  {filteredBlogs.map((blog) => (
                    <button
                      key={blog.slug}
                      onClick={() => navigateTo(`/blog/${blog.slug}`)}
                      className="w-full flex items-center px-3 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors group"
                    >
                      <FileText className="w-5 h-5 mr-3 text-gray-400 group-hover:text-primary transition-colors" />
                      <span className="flex-1 font-medium truncate">{blog.title}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {filteredActions.length === 0 && filteredBlogs.length === 0 && !smartResults?.length && (
                <div className="px-4 py-8 text-center text-gray-500">
                  No results found for "{query}"
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
