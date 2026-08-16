"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Home, FolderGit2, FileText, User, Mail, 
  Moon, Sun, Command, ArrowRight 
} from "lucide-react";

interface Blog {
  title: string;
  slug: string;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [blogs, setBlogs] = useState<Blog[]>([]);
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
          if (data.posts) setBlogs(data.posts);
        })
        .catch((err) => console.error("Failed to fetch blogs for palette", err));
    }
  }, [isOpen, blogs.length]);

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

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
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
              {filteredActions.length === 0 && filteredBlogs.length === 0 && (
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
