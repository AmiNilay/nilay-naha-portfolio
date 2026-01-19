"use client";
import { motion } from "framer-motion";

const skills = {
    Frontend: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion"],
    Backend: ["Node.js", "Python", "MongoDB", "PostgreSQL", "REST APIs"],
    "AI & Tools": ["OpenCV", "TensorFlow", "Git", "Docker", "VS Code"]
};

export default function Skills() {
    return (
        <section className="py-20 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold mb-12 text-center">Technical Arsenal</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {Object.entries(skills).map(([category, items], idx) => (
                        <motion.div 
                            key={category}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-card border border-border p-6 rounded-lg"
                        >
                            <h3 className="text-xl font-semibold mb-4 text-emerald-500">{category}</h3>
                            <div className="flex flex-wrap gap-2">
                                {items.map(skill => (
                                    <span key={skill} className="bg-background border border-border px-3 py-1 rounded-md text-sm">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}