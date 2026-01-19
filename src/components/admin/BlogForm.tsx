"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IBlog } from "@/types";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/Toast";

interface BlogFormProps {
    initialData?: Partial<IBlog>;
    isEditing?: boolean;
}

export default function BlogForm({ initialData, isEditing = false }: BlogFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        content: "",
        coverImage: "",
        tags: "",
        readTime: 5,
        published: true
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                slug: initialData.slug || "",
                description: initialData.description || "",
                content: initialData.content || "",
                coverImage: initialData.coverImage || "",
                tags: initialData.tags ? initialData.tags.join(", ") : "",
                readTime: initialData.readTime || 5,
                published: initialData.published ?? true
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("admin_secret");

        const payload = {
            ...formData,
            tags: formData.tags.split(",").map(s => s.trim()).filter(Boolean),
            readTime: Number(formData.readTime)
        };

        const url = isEditing && initialData?._id 
            ? `/api/blog/${initialData._id}` 
            : "/api/blog";
            
        const method = isEditing ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { 
                    "Content-Type": "application/json",
                    "x-admin-secret": token || "" 
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to save post");
            
            setToast({ message: "Post saved successfully!", type: "success" });

            setTimeout(() => {
                router.push("/admin/blog");
                router.refresh();
            }, 1000);

        } catch (error) {
            console.error(error);
            setToast({ message: "Error saving blog post", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg border border-border relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                    <Input 
                        id="title"
                        title="Blog Title"
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})} 
                        required 
                    />
                </div>
                <div>
                    <label htmlFor="slug" className="block text-sm font-medium mb-1">Slug</label>
                    <Input 
                        id="slug"
                        title="URL Slug"
                        value={formData.slug} 
                        onChange={e => setFormData({...formData, slug: e.target.value})} 
                        required 
                    />
                </div>
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">Short Description</label>
                <Input 
                    id="description"
                    title="Short Description"
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    required 
                />
            </div>
            
             <div>
                <label htmlFor="coverImage" className="block text-sm font-medium mb-1">Cover Image URL</label>
                <Input 
                    id="coverImage"
                    title="Cover Image URL"
                    value={formData.coverImage} 
                    onChange={e => setFormData({...formData, coverImage: e.target.value})} 
                />
            </div>

            <div>
                <label htmlFor="content" className="block text-sm font-medium mb-1">Content (Markdown)</label>
                <textarea 
                    id="content"
                    title="Blog Content"
                    className="w-full h-96 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.content} 
                    onChange={e => setFormData({...formData, content: e.target.value})} 
                    required 
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <label htmlFor="tags" className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                    <Input 
                        id="tags"
                        title="Tags"
                        value={formData.tags} 
                        onChange={e => setFormData({...formData, tags: e.target.value})} 
                    />
                </div>
                <div>
                    <label htmlFor="readTime" className="block text-sm font-medium mb-1">Read Time (mins)</label>
                    <Input 
                        id="readTime"
                        title="Read Time in Minutes"
                        type="number"
                        value={formData.readTime} 
                        onChange={e => setFormData({...formData, readTime: Number(e.target.value)})} 
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
                <input 
                    type="checkbox" 
                    id="published"
                    title="Publish Status"
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    checked={formData.published} 
                    onChange={e => setFormData({...formData, published: e.target.checked})} 
                />
                <label htmlFor="published" className="text-sm font-medium">
                    Publish immediately
                </label>
            </div>

            <div className="pt-4">
                <Button disabled={loading} className="w-full md:w-auto md:px-8">
                    {loading ? "Saving..." : isEditing ? "Update Post" : "Create Post"}
                </Button>
            </div>
        </form>
    );
}