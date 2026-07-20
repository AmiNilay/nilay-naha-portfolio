"use client";

import { motion } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { StaggerContainer, StaggerItem } from "@/components/ui/StaggerContainer";

const skills = {
  Frontend: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion"],
  Backend: ["Node.js", "Python", "MongoDB", "PostgreSQL", "REST APIs"],
  "AI & Tools": ["OpenCV", "TensorFlow", "Git", "Docker", "VS Code"],
};

export default function Skills() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <AnimatedSection direction="up">
          <h2 className="text-3xl font-bold mb-12 text-center">Technical Arsenal</h2>
        </AnimatedSection>

        <StaggerContainer
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          staggerDelay={0.15}
        >
          {Object.entries(skills).map(([category, items]) => (
            <StaggerItem key={category}>
              <div className="bg-card border border-border p-6 rounded-lg h-full hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <h3 className="text-xl font-semibold mb-4 text-emerald-500">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <motion.span
                      key={skill}
                      whileHover={{ scale: 1.08, y: -2 }}
                      className="bg-background border border-border px-3 py-1 rounded-md text-sm cursor-default"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}