"use client";

import { useState, useRef } from "react";
import {
  Upload,
  X,
  Copy,
  Check,
  Loader2,
  ImageIcon,
  FolderOpen,
} from "lucide-react";

type Category =
  | "home"
  | "resume"
  | "projects"
  | "blogs"
  | "about"
  | "skills"
  | "misc";

interface Props {
  defaultCategory?: Category;
  defaultSubfolder?: string;
  fixedFilename?: string;
  onUpload?: (url: string, path: string) => void;
}

interface CategoryOption {
  value: Category;
  label: string;
  hasSubfolder: boolean;
  placeholder: string;
}

const CATEGORIES: CategoryOption[] = [
  { value: "home", label: "Home Page", hasSubfolder: false, placeholder: "profile" },
  { value: "resume", label: "Resume", hasSubfolder: false, placeholder: "resume" },
  { value: "projects", label: "Projects", hasSubfolder: true, placeholder: "project-name" },
  { value: "blogs", label: "Blogs", hasSubfolder: true, placeholder: "blog-post-title" },
  { value: "about", label: "About", hasSubfolder: false, placeholder: "about-photo" },
  { value: "skills", label: "Skills", hasSubfolder: false, placeholder: "skill-icon" },
  { value: "misc", label: "Miscellaneous", hasSubfolder: true, placeholder: "folder-name" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60);
}

export default function ImageUploader({
  defaultCategory = "misc",
  defaultSubfolder = "",
  fixedFilename,
  onUpload,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [category, setCategory] = useState<Category>(defaultCategory);
  const [subfolder, setSubfolder] = useState(defaultSubfolder);
  const [filename, setFilename] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [uploadedPath, setUploadedPath] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCat = CATEGORIES.find((c) => c.value === category);

  const handleFileSelect = (f: File) => {
    setFile(f);
    setUploadedUrl("");
    setUploadedPath("");
    setError("");

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);

    if (!fixedFilename && !filename) {
      const nameWithoutExt = f.name.replace(/\.[^/.]+$/, "");
      setFilename(slugify(nameWithoutExt));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.type.startsWith("image/") || f.type === "application/pdf")) {
      handleFileSelect(f);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const finalFilename = fixedFilename || filename;
    if (!finalFilename.trim()) {
      setError("Please enter a filename.");
      return;
    }

    if (selectedCat?.hasSubfolder && !subfolder.trim()) {
      setError("Please enter a subfolder name.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      formData.append("subfolder", subfolder);
      formData.append("filename", finalFilename);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setUploadedUrl(data.url);
        setUploadedPath(data.path);
        onUpload?.(data.url, data.path);
      } else {
        setError(data.error || "Upload failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview("");
    setFilename("");
    setUploadedUrl("");
    setUploadedPath("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(uploadedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may fail
    }
  };

  // Build path preview
  const pathPreview = (() => {
    const ext = file?.name.split(".").pop() || "webp";
    const fname = slugify(fixedFilename || filename) || "filename";
    const cat = CATEGORIES.find((c) => c.value === category);
    if (cat?.hasSubfolder && subfolder) {
      return `${category}/${slugify(subfolder)}/${fname}.${ext}`;
    }
    return `${category}/${fname}.${ext}`;
  })();

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      {!file && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ".concat(
              dragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
            )
          }
        >
          <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">
            Drop an image here or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PNG, JPG, WebP, SVG, GIF, PDF
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelect(f);
            }}
            className="hidden"
          />
        </div>
      )}

      {/* Selected File + Options */}
      {file && !uploadedUrl && (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            {file.type === "application/pdf" ? (
              <div className="flex items-center justify-center gap-3 py-10">
                <FolderOpen className="w-8 h-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  {file.name}
                </span>
              </div>
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 mx-auto object-contain"
              />
            )}
            <button
              type="button"
              onClick={handleReset}
              className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-md font-mono">
              {(file.size / 1024).toFixed(1)} KB
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as Category);
                setSubfolder("");
              }}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subfolder */}
          {selectedCat?.hasSubfolder && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Subfolder
              </label>
              <input
                type="text"
                value={subfolder}
                onChange={(e) => setSubfolder(e.target.value)}
                placeholder={selectedCat.placeholder}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
              {subfolder && (
                <p className="text-xs text-gray-400 mt-1">
                  Will be saved as: {slugify(subfolder)}
                </p>
              )}
            </div>
          )}

          {/* Filename */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
              Filename
            </label>
            <div className="relative">
              <input
                type="text"
                value={fixedFilename || filename}
                onChange={(e) => {
                  if (!fixedFilename) setFilename(e.target.value);
                }}
                disabled={!!fixedFilename}
                placeholder={selectedCat?.placeholder || "filename"}
                className={
                  "w-full px-3 py-2.5 pr-16 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none ".concat(
                    fixedFilename ? "opacity-60 cursor-not-allowed" : ""
                  )
                }
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono pointer-events-none">
                .{file.name.split(".").pop()}
              </span>
            </div>
          </div>

          {/* Path Preview */}
          <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 flex items-center gap-2">
            <FolderOpen className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <p className="text-xs font-mono text-gray-500 truncate">
              {pathPreview}
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 font-medium bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Upload Button */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={
              uploading ||
              (!fixedFilename && !filename.trim())
            }
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload
              </>
            )}
          </button>
        </div>
      )}

      {/* Success */}
      {uploadedUrl && (
        <div className="space-y-3">
          {/* Uploaded Preview */}
          {file?.type === "application/pdf" ? (
            <div className="flex items-center justify-center gap-3 py-8 bg-green-50 border border-green-200 rounded-xl">
              <Check className="w-6 h-6 text-green-500" />
              <span className="text-sm font-medium text-green-700">
                PDF uploaded successfully
              </span>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-green-200 bg-green-50">
              <img
                src={uploadedUrl}
                alt="Uploaded"
                className="max-h-48 mx-auto object-contain"
              />
            </div>
          )}

          {/* Path */}
          <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2 flex items-center gap-2">
            <FolderOpen className="w-3.5 h-3.5 text-green-500 shrink-0" />
            <p className="text-xs font-mono text-green-700 truncate">
              {uploadedPath}
            </p>
          </div>

          {/* URL + Copy */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={uploadedUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-600 truncate"
            />
            <button
              type="button"
              onClick={copyUrl}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors shrink-0"
              title="Copy URL"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>

          {/* Upload Another */}
          <button
            type="button"
            onClick={handleReset}
            className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
          >
            Upload another file
          </button>
        </div>
      )}
    </div>
  );
}