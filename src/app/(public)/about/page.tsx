"use client";

import { BookOpen, Cpu } from "lucide-react";
import SkillKeyboard from "@/components/ui/SkillKeyboard";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-24 min-h-screen max-w-5xl">
      
      {/* Intro Section */}
      <div className="max-w-4xl mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">About Me</h1>
        <div className="prose dark:prose-invert max-w-none text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          <p>
            Hi, I'm <strong>Nilay Naha</strong>. I am currently a final-year B.Tech student specializing in 
            <strong> Artificial Intelligence and Machine Learning</strong> at Siliguri Institute of Technology.
          </p>
          <p className="mt-4">
            My passion lies in bridging the gap between complex AI models and user-friendly web applications. 
            I have a strong background in Python and Computer Vision, and I am currently exploring full-stack development with Next.js.
          </p>
        </div>
      </div>

      {/* --- THE SKILL KEYBOARD SECTION --- */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold mb-8 flex items-center">
          <Cpu className="w-6 h-6 mr-2 text-primary" /> Technical Arsenal
        </h2>
        {/* Removed the 'p-8' padding and the text <p> tag for a cleaner look */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Render the Keyboard here */}
          <SkillKeyboard />
        </div>
      </div>

      {/* Education Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <BookOpen className="w-6 h-6 mr-2 text-primary" /> Education
        </h2>
        <div className="space-y-8 border-l-2 border-gray-200 dark:border-gray-800 ml-3 pl-8 relative">
          
          {/* Degree 1 */}
          <div className="relative">
            <span className="absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-background bg-primary"></span>
            <h3 className="font-bold text-lg">B.Tech in CSE (AI & ML)</h3>
            <p className="text-gray-500">Siliguri Institute of Technology</p>
            <span className="text-sm text-gray-400">2023 - 2026</span>
          </div>

          {/* Degree 2 */}
          <div className="relative">
            <span className="absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-background bg-gray-400 dark:bg-gray-600"></span>
            <h3 className="font-bold text-lg">Diploma in CST</h3>
            <p className="text-gray-500">Siliguri Govt. Polytechnic</p>
            <span className="text-sm text-gray-400">Completed 2023</span>
          </div>

        </div>
      </div>

    </div>
  );
}