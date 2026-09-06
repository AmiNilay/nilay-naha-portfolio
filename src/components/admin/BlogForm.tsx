"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IBlog } from "@/types";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/Toast";
import { Eye, X, Upload, ImageIcon } from "lucide-react";

interface BlogFormProps {
  initialData?: Partial<IBlog>;
  isEditing?: boolean;
}

export default function BlogForm({
  initialData,
  isEditing = false,
}: BlogFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // File state: holds the actual File object selected by the user
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    gDriveImage: "",
    relatedProject: "",
    tags: "",
    readTime: 5,
    published: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        slug: initialData.slug || "",
        excerpt: initialData.description || initialData.excerpt || "",
        content: initialData.content || "",
        coverImage: initialData.coverImage || "",
        gDriveImage: (initialData as any).gDriveImage || "",
        relatedProject: (initialData as any).relatedProject || "",
        tags: initialData.tags ? initialData.tags.join(", ") : "",
        readTime: initialData.readTime || 5,
        published: initialData.published ?? true,
      });

      if (initialData.coverImage) {
        setImagePreviewUrl(initialData.coverImage);
      }
    }
  }, [initialData]);

  /**
   * Handle file selection from the input.
   * Creates a local preview URL and stores the File object.
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setToast({ message: "Please select an image file.", type: "error" });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setToast({
        message: "Image must be smaller than 10MB.",
        type: "error",
      });
      return;
    }

    setImageFile(file);

    // Create a local preview URL
    const objectUrl = URL.createObjectURL(file);
    setImagePreviewUrl(objectUrl);
  };

  /**
   * Clear the selected file and reset the preview.
   */
  const clearSelectedFile = () => {
    setImageFile(null);
    setImagePreviewUrl(formData.coverImage || "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();

      // Text fields
      submitData.append("title", formData.title);
      submitData.append("slug", formData.slug);
      submitData.append("excerpt", formData.excerpt);
      submitData.append("content", formData.content);
      submitData.append("gDriveImage", formData.gDriveImage);
      submitData.append("relatedProject", formData.relatedProject);
      submitData.append(
        "publishDate",
        initialData?.publishDate
          ? new Date(initialData.publishDate).toISOString()
          : new Date().toISOString()
      );

      // Image: either a new file upload, or keep the existing URL
      if (imageFile) {
        submitData.append("image", imageFile);
      } else if (formData.coverImage) {
        // No new file, but a URL was entered manually
        submitData.append("existingCoverImage", formData.coverImage);
      }

      const url =
        isEditing && initialData?._id
          ? `/api/blog/${initialData._id}`
          : "/api/blog";

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: submitData,
        // Do NOT set Content-Type header -- the browser sets it
        // automatically with the correct boundary for FormData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to save post");
      }

      setToast({ message: "Post saved successfully!", type: "success" });

      setTimeout(() => {
        router.push("/admin/blog");
        router.refresh();
      }, 1000);
    } catch (error: any) {
      console.error("Save error:", error);
      setToast({
        message: error.message || "Error saving blog post",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-500">
                Live Preview Mode
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-lg font-medium transition-colors"
              >
                <X size={20} /> Close Preview
              </button>
            </div>

            <article className="prose max-w-none">
              <h1 className="text-4xl font-extrabold mb-4">
                {formData.title || "Untitled Post"}
              </h1>

              <div className="flex items-center gap-4 text-gray-500 mb-8">
                <span>{formData.readTime} min read</span>
                <span>--</span>
                <div className="flex gap-2">
                  {formData.tags &&
                    formData.tags.split(",").map((tag, i) => (
                      <span key={i} className="text-primary">
                        #{tag.trim()}
                      </span>
                    ))}
                </div>
              </div>

              {imagePreviewUrl && (
                <img
                  src={imagePreviewUrl}
                  alt="Blog Cover"
                  className="w-full h-auto rounded-xl mb-8 shadow-md border"
                />
              )}

              <div className="whitespace-pre-wrap bg-gray-50 p-6 rounded-xl border text-lg leading-relaxed">
                {formData.content || "Start writing your content..."}
              </div>
            </article>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-card p-6 rounded-lg border border-border relative"
      >
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Title + Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium mb-1"
            >
              Title
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-1">
              Slug
            </label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label
            htmlFor="excerpt"
            className="block text-sm font-medium mb-1"
          >
            Short Description
          </label>
          <Input
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) =>
              setFormData({ ...formData, excerpt: e.target.value })
            }
            required
          />
        </div>

        {/* Cover Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Cover Image
          </label>

          <div className="flex flex-col gap-3">
            {/* File input */}
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="coverImageFile"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:text-blue-600 rounded-lg text-sm font-medium text-gray-600 transition-colors"
              >
                <Upload size={16} />
                {imageFile ? "Change File" : "Upload from Computer"}
              </button>

              {imageFile && (
                <button
                  type="button"
                  onClick={clearSelectedFile}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X size={14} />
                  Remove
                </button>
              )}
            </div>

            {/* Selected file name */}
            {imageFile && (
              <p className="text-xs text-gray-500">
                Selected: {imageFile.name} (
                {(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                -- will be uploaded to GitHub on save
              </p>
            )}

            {/* Image preview */}
            {imagePreviewUrl && (
              <div className="relative w-full max-w-md">
                <img
                  src={imagePreviewUrl}
                  alt="Cover preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
                {imageFile && (
                  <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
                    New
                  </span>
                )}
              </div>
            )}

            {/* Manual URL fallback */}
            <div>
              <label
                htmlFor="coverImageUrl"
                className="block text-xs text-gray-500 mb-1"
              >
                Or paste an image URL directly:
              </label>
              <Input
                id="coverImageUrl"
                value={formData.coverImage}
                onChange={(e) => {
                  setFormData({ ...formData, coverImage: e.target.value });
                  if (!imageFile) {
                    setImagePreviewUrl(e.target.value);
                  }
                }}
                placeholder="https://raw.githubusercontent.com/..."
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium mb-1"
          >
            Content (Markdown)
          </label>
          <textarea
            id="content"
            className="w-full h-96 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            required
          />
        </div>

        {/* Tags + Read Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label
              htmlFor="tags"
              className="block text-sm font-medium mb-1"
            >
              Tags (comma separated)
            </label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor="readTime"
              className="block text-sm font-medium mb-1"
            >
              Read Time (mins)
            </label>
            <Input
              id="readTime"
              type="number"
              value={formData.readTime}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  readTime: Number(e.target.value),
                })
              }
            />
          </div>
        </div>

        {/* Published checkbox */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="published"
            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            checked={formData.published}
            onChange={(e) =>
              setFormData({ ...formData, published: e.target.checked })
            }
          />
          <label htmlFor="published" className="text-sm font-medium">
            Publish immediately
          </label>
        </div>

        {/* Action buttons */}
        <div className="pt-4 flex flex-wrap items-center gap-4">
          <Button disabled={loading} className="w-full md:w-auto md:px-8">
            {loading
              ? "Uploading..."
              : isEditing
                ? "Update Post"
                : "Create Post"}
          </Button>

          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center justify-center gap-2 px-6 py-2 border-2 border-gray-300 hover:border-primary hover:text-primary rounded-md font-medium transition-all w-full md:w-auto"
          >
            <Eye size={18} /> Preview
          </button>
        </div>
      </form>
    </>
  );
}