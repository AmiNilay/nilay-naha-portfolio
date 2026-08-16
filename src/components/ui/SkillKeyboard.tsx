"use client";

import { SKILL_CATEGORIES } from "@/lib/skillData";

interface SkillKeyboardProps {
  activeSkills?: string[];
}

export default function SkillKeyboard({ activeSkills }: SkillKeyboardProps) {
  // Filter categories to only show skills that are active (selected in admin)
  const displayCategories = SKILL_CATEGORIES.map(category => ({
    ...category,
    skills: category.skills.filter(skill => 
      !activeSkills || activeSkills.length === 0 || activeSkills.some(active => active.toLowerCase() === skill.name.toLowerCase())
    )
  })).filter(category => category.skills.length > 0);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
      {displayCategories.map((category, idx) => (
        <div key={idx} className="flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
            {category.title}
          </h3>
          <div className="flex flex-wrap gap-3">
            {category.skills.map((skill) => (
              <div 
                key={skill.name} 
                className="group flex items-center gap-2.5 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 cursor-default hover:-translate-y-0.5"
              >
                <skill.Icon 
                  className="w-5 h-5 transition-transform group-hover:scale-110" 
                  style={{ color: skill.color }} 
                />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {skill.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
