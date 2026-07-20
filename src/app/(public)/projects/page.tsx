"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { StaggerContainer, StaggerItem } from "@/components/ui/StaggerContainer";

export default function PublicProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <AnimatedSection direction="up">
        <h1 className="text-4xl font-bold mb-12">My Projects</h1>
      </AnimatedSection>

      {projects.length === 0 ? (
        <AnimatedSection direction="fade">
          <p className="text-gray-500 italic">No projects found. Check back soon!</p>
        </AnimatedSection>
      ) : (
        <StaggerContainer
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          staggerDelay={0.12}
        >
          {projects.map((project) => (
            <StaggerItem key={project._id}>
              <Link
                href={`/projects/${project.slug}`}
                className="group block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full"
              >
                <div className="h-48 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                  {project.image && (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </h2>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                    {project.description}
                  </p>
                  <span className="text-primary font-bold inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                    View Details <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}