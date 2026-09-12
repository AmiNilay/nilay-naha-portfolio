"use client";

import { useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  Upload,
  Home,
  FileText,
  FolderGit2,
  PenTool,
  User,
  Wrench,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";

interface UploadedFile {
  url: string;
  path: string;
  timestamp: number;
}

const sections = [
  {
    id: "home",
    label: "Home Page",
    icon: Home,
    description: "Profile picture, hero background, banner images",
    category: "home" as const,
    items: [
      { filename: "profile-pic", label: "Profile Picture" },
      { filename: "hero-bg", label: "Hero Background" },
      { filename: "banner", label: "Banner Image" },
    ],
  },
  {
    id: "about",
    label: "About Page",
    icon: User,
    description: "Photos and images for the about section",
    category: "about" as const,
    items: [
      { filename: "about-photo", label: "About Photo" },
      { filename: "team", label: "Team / Workspace" },
    ],
  },
  {
    id: "resume",
    label: "Resume",
    icon: FileText,
    description: "Resume PDF and related documents",
    category: "resume" as const,
    items: [
      { filename: "resume", label: "Resume PDF" },
      { filename: "certificate", label: "Certificate" },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    icon: FolderGit2,
    description: "Project thumbnails and screenshots",
    category: "projects" as const,
    items: [],
  },
  {
    id: "blogs",
    label: "Blog Posts",
    icon: PenTool,
    description: "Blog thumbnails, cover images, and inline images",
    category: "blogs" as const,
    items: [],
  },
  {
    id: "skills",
    label: "Skills & Tech",
    icon: Wrench,
    description: "Technology icons, skill logos, badges",
    category: "skills" as const,
    items: [
      { filename: "nextjs-icon", label: "Next.js Icon" },
      { filename: "react-icon", label: "React Icon" },
      { filename: "typescript-icon", label: "TypeScript Icon" },
    ],
  },
  {
    id: "misc",
    label: "Miscellaneous",
    icon: MoreHorizontal,
    description: "Other files and assets",
    category: "misc" as const,
    items: [],
  },
];

export default function AdminUploads() {
  const [openSection, setOpenSection] = useState<string | null>("home");
  const [allUploaded, setAllUploaded] = useState<UploadedFile[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleUpload = (url: string, path: string) => {
    setAllUploaded((prev) => [
      { url, path, timestamp: Date.now() },
      ...prev,
    ]);
  };

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-gray-900">
                Upload Assets
              </h1>
              <p className="text-xs text-gray-400">
                Organize files into your assets repository
              </p>
            </div>
          </div>

          {allUploaded.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4 text-green-500" />
              {allUploaded.length} uploaded
              {showHistory ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Upload History */}
        {showHistory && allUploaded.length > 0 && (
          <div className="mb-6 bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-green-50 border-b border-green-100">
              <p className="text-sm font-bold text-green-700">
                Recent Uploads
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {allUploaded.map((item, i) => (
                <div
                  key={item.timestamp}
                  className="px-4 py-3 flex items-center gap-3"
                >
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-gray-500 truncate">
                      {item.path}
                    </p>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-700 shrink-0"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sections */}
        <div className="space-y-3">
          {sections.map((section) => {
            const isOpen = openSection === section.id;
            const Icon = section.icon;

            return (
              <div
                key={section.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                {/* Section Header */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">
                      {section.label}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {section.description}
                    </p>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </button>

                {/* Section Content */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                    {/* Pre-defined items (home, about, resume, skills) */}
                    {section.items.length > 0 && (
                      <div className="space-y-4">
                        {section.items.map((item) => (
                          <div key={item.filename}>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                              {item.label}
                            </p>
                            <ImageUploader
                              defaultCategory={section.category}
                              fixedFilename={item.filename}
                              onUpload={handleUpload}
                            />
                          </div>
                        ))}

                        {/* Generic upload for this category */}
                        <div className="pt-3 border-t border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Custom Upload
                          </p>
                          <ImageUploader
                            defaultCategory={section.category}
                            onUpload={handleUpload}
                          />
                        </div>
                      </div>
                    )}

                    {/* Dynamic items (projects, blogs, misc) - user provides names */}
                    {section.items.length === 0 && (
                      <div>
                        <p className="text-xs text-gray-400 mb-3">
                          Enter a name and upload. Files will be organized into subfolders automatically.
                        </p>
                        <ImageUploader
                          defaultCategory={section.category}
                          onUpload={handleUpload}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Info */}
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            How it works
          </h3>
          <div className="space-y-2 text-xs text-gray-500 leading-relaxed">
            <p>
              <strong className="text-gray-700">1. Pick a category</strong> - Each
              category maps to a folder in your assets repository.
            </p>
            <p>
              <strong className="text-gray-700">2. Name your file</strong> - The
              filename is slugified automatically (e.g., "My Photo" becomes
              "my-photo").
            </p>
            <p>
              <strong className="text-gray-700">3. Subfolders</strong> - Projects
              and blogs require a subfolder name (project name or blog title) to
              keep assets organized.
            </p>
            <p>
              <strong className="text-gray-700">4. Copy the URL</strong> - After
              uploading, copy the raw URL and use it anywhere in your portfolio
              code.
            </p>
          </div>

          <div className="mt-4 bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-500">
            <p className="text-gray-400 mb-1">Example folder structure:</p>
            <p>home/profile-pic.webp</p>
            <p>projects/my-app/thumbnail.webp</p>
            <p>blogs/getting-started/cover.webp</p>
            <p>about/team-photo.webp</p>
            <p>resume/resume.pdf</p>
          </div>
        </div>
      </div>
    </div>
  );
}