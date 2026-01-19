"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IProject } from "@/types";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/Toast";

interface ProjectFormProps {
    initialData?: Partial<IProject>;
    isEditing?: boolean;
}

export default function ProjectForm({ initialData, isEditing = false }: ProjectFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        content: "",
        githubUrl: "",
        liveUrl: "",
        techStack: "",
        images: ""
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                slug: initialData.slug || "",
                description: initialData.description || "",
                content: initialData.content || "",
                githubUrl: initialData.githubUrl || "",
                liveUrl: initialData.liveUrl || "",
                techStack: initialData.techStack ? initialData.techStack.join(", ") : "",
                images: initialData.images ? initialData.images.join(", ") : ""
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("admin_secret");

        const payload = {
            ...formData,
            techStack: formData.techStack.split(",").map(s => s.trim()).filter(Boolean),
            images: formData.images.split(",").map(s => s.trim()).filter(Boolean)
        };

        const url = isEditing && initialData?._id 
            ? `/api/projects/${initialData._id}` 
            : "/api/projects";
            
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

            if (!res.ok) throw new Error("Failed to save project");
            
            setToast({ message: "Project saved successfully!", type: "success" });
            
            // Wait 1s so user sees the toast before redirecting
            setTimeout(() => {
                router.push("/admin/projects");
                router.refresh();
            }, 1000);

        } catch (error) {
            console.error(error);
            setToast({ message: "Error saving project", type: "error" });
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
                        title="Project Title"
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})} 
                        required 
                        placeholder="e.g. AI Hand Tracker"
                    />
                </div>
                <div>
                    <label htmlFor="slug" className="block text-sm font-medium mb-1">Slug (URL Identifier)</label>
                    <Input 
                        id="slug"
                        title="URL Slug"
                        value={formData.slug} 
                        onChange={e => setFormData({...formData, slug: e.target.value})} 
                        required 
                        placeholder="e.g. ai-hand-tracker"
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
                    placeholder="Brief summary for the card view..."
                />
            </div>

            <div>
                <label htmlFor="content" className="block text-sm font-medium mb-1">Content (Markdown Supported)</label>
                <textarea 
                    id="content"
                    title="Project Content"
                    className="w-full h-64 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.content} 
                    onChange={e => setFormData({...formData, content: e.target.value})} 
                    required 
                    placeholder="Full project details..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="techStack" className="block text-sm font-medium mb-1">Tech Stack (comma separated)</label>
                    <Input 
                        id="techStack"
                        title="Technologies Used"
                        value={formData.techStack} 
                        onChange={e => setFormData({...formData, techStack: e.target.value})} 
                        placeholder="React, Python, OpenCV" 
                    />
                </div>
                <div>
                    <label htmlFor="images" className="block text-sm font-medium mb-1">Image URL</label>
                    <Input 
                        id="images"
                        title="Project Image URL"
                        value={formData.images} 
                        onChange={e => setFormData({...formData, images: e.target.value})} 
                        placeholder="https://example.com/image.png"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="githubUrl" className="block text-sm font-medium mb-1">GitHub URL</label>
                    <Input 
                        id="githubUrl"
                        title="GitHub Repository URL"
                        value={formData.githubUrl} 
                        onChange={e => setFormData({...formData, githubUrl: e.target.value})} 
                        placeholder="https://github.com/..."
                    />
                </div>
                <div>
                    <label htmlFor="liveUrl" className="block text-sm font-medium mb-1">Live Demo URL</label>
                    <Input 
                        id="liveUrl"
                        title="Live Demo URL"
                        value={formData.liveUrl} 
                        onChange={e => setFormData({...formData, liveUrl: e.target.value})} 
                        placeholder="https://..."
                    />
                </div>
            </div>

            <div className="pt-4">
                <Button disabled={loading} className="w-full md:w-auto md:px-8">
                    {loading ? "Saving..." : isEditing ? "Update Project" : "Create Project"}
                </Button>
            </div>
        </form>
    );
}