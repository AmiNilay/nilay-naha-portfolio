"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Sparkles, ExternalLink, Download, Search } from "lucide-react";
import Link from "next/link";

interface LinkItem { label: string; url: string; }
interface Rule { keywords: string[]; answer: string; quickReplies?: string[]; links?: LinkItem[]; }
interface Message { id: string; role: "bot" | "user"; content: string; quickReplies?: string[]; links?: LinkItem[]; isResumeTrigger?: boolean; }

const SUGGESTED_QUESTIONS = ["What projects have you built?", "What languages do you know?", "Download Resume", "Why should we hire you?"];

// Fuzzy Matching Algorithm (Levenshtein Distance)
const getLevenshteinDistance = (a: string, b: string) => {
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const arr = [];
  for (let i = 0; i <= b.length; i++) {
    arr[i] = [i];
    for (let j = 1; j <= a.length; j++) {
      arr[i][j] = i === 0 ? j : Math.min(arr[i - 1][j] + 1, arr[i][j - 1] + 1, arr[i - 1][j - 1] + (a[j - 1] === b[i - 1] ? 0 : 1));
    }
  }
  return arr[b.length][a.length];
};

// Stop words to ignore during matching
const STOP_WORDS = ["what", "is", "the", "have", "you", "in", "do", "a", "an", "to", "for", "of", "my", "your"];

const isFuzzyMatch = (input: string, keyword: string) => {
  const inputWords = input.toLowerCase().split(/\s+/).filter(w => !STOP_WORDS.includes(w));
  const keywordWords = keyword.toLowerCase().split(/\s+/).filter(w => !STOP_WORDS.includes(w));
  
  if (input.toLowerCase().includes(keyword.toLowerCase())) return true;
  
  for (const kw of keywordWords) {
    if (kw.length < 3) continue; 
    for (const iw of inputWords) {
      if (getLevenshteinDistance(kw, iw) <= 2) return true;
    }
  }
  return false;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [rules, setRules] = useState<Rule[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "bot", content: "Hi! I'm Nilay's virtual assistant. How can I help you today?" },
  ]);

  useEffect(() => {
    fetch("/api/chatbot").then(res => res.json()).then(data => { if (data.rules) setRules(data.rules); });
    fetch("/api/hero").then(res => res.json()).then(data => { if (data.resumeUrl) setResumeUrl(data.resumeUrl); });
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-Suggest Logic
  const suggestions = input.trim().length > 1 
    ? Array.from(new Set(rules.flatMap(r => r.keywords))).filter(k => k.toLowerCase().includes(input.toLowerCase())).slice(0, 3)
    : [];

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: text }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let responseText = "I'm just a simple bot and I don't know the answer to that yet! Please reach out to Nilay directly.";
      let quickReplies: string[] = [];
      let links: LinkItem[] = [];
      let isResumeTrigger = false;

      // Check for Resume Download Trigger
      if (isFuzzyMatch(text, "resume") || isFuzzyMatch(text, "cv") || isFuzzyMatch(text, "download")) {
        responseText = resumeUrl ? "Here is Nilay's resume! Click the button below to download it." : "Sorry, Nilay hasn't uploaded a resume yet.";
        isResumeTrigger = !!resumeUrl;
      } else {
        // ✅ FIX: Use Rule | undefined to prevent TypeScript closure inference errors
        let bestRule: Rule | undefined = undefined;
        let highestScore = 0;

        // Scoring algorithm to find the BEST match
        rules.forEach(rule => {
          let score = 0;
          rule.keywords.forEach(kw => {
            if (isFuzzyMatch(text, kw)) score += 1;
          });
          if (score > highestScore) {
            highestScore = score;
            bestRule = rule;
          }
        });

        if (bestRule && highestScore > 0) {
          responseText = bestRule.answer;
          quickReplies = bestRule.quickReplies || [];
          links = bestRule.links || [];
        }
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "bot", content: responseText, quickReplies, links, isResumeTrigger }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      <motion.button onClick={() => setIsOpen(true)} className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center transition-all ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <MessageSquare className="w-6 h-6" />
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-900 dark:border-white rounded-full"></span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-4rem)] bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
            
            <div className="bg-white dark:bg-zinc-950 p-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 z-10">
              <div className="flex items-center gap-3">
                <div className="relative bg-zinc-100 dark:bg-zinc-900 p-2 rounded-full">
                  <Bot className="w-5 h-5 text-zinc-900 dark:text-white" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-950 rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Nilay's Assistant</h3>
                  <p className="text-[10px] text-zinc-500 flex items-center gap-1 font-medium"><Sparkles className="w-3 h-3" /> AI Powered</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-zinc-50/50 dark:bg-zinc-900/20 relative">
              {messages.map((msg) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "bot" && <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-zinc-700 dark:text-zinc-300" /></div>}
                  
                  <div className="flex flex-col gap-2 max-w-[80%]">
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-br-sm font-medium" : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-bl-sm border border-zinc-200 dark:border-zinc-800"}`}>
                      {msg.content}
                    </div>

                    {/* Inline Links */}
                    {msg.links && msg.links.length > 0 && (
                      <div className="flex flex-col gap-2 mt-1">
                        {msg.links.map((link, i) => (
                          <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-xl hover:opacity-90 transition-opacity">
                            {link.label} <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Resume Download Trigger */}
                    {msg.isResumeTrigger && resumeUrl && (
                      <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-2 mt-1 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">
                        Download Resume <Download className="w-3 h-3" />
                      </a>
                    )}

                    {/* Dynamic Quick Replies */}
                    {msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.quickReplies.map((qr, i) => (
                          <button key={i} onClick={() => handleSend(qr)} className="text-xs px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shadow-sm font-medium">
                            {qr}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  </div>
                  <div className="px-4 py-3 bg-white dark:bg-zinc-900 rounded-2xl rounded-bl-sm shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                </motion.div>
              )}

              {/* Suggested Questions */}
              {messages.length === 1 && !isTyping && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="pt-2 flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="text-xs px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all shadow-sm font-medium"
                    >
                      {q}
                    </button>
                  ))}
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Auto-Suggest Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute bottom-[90px] left-4 right-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden z-20">
                {suggestions.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => { setInput(s); handleSend(s); }} 
                    className="w-full text-left px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0 transition-colors"
                  >
                    <Search className="w-3 h-3 text-zinc-400" /> {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 relative z-10">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="flex items-center gap-2 relative"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 py-3 pl-4 pr-12 bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:bg-white dark:focus:bg-zinc-950 focus:border-zinc-300 dark:focus:border-zinc-700 rounded-xl text-sm outline-none transition-all text-zinc-900 dark:text-white placeholder-zinc-500"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 p-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-zinc-900 dark:disabled:hover:bg-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              
              {/* Footer Note */}
              <div className="mt-4 text-center">
                <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-medium">
                  This is an automated bot. For real interaction, please{" "}
                  <Link href="/contact" onClick={() => setIsOpen(false)} className="text-zinc-900 dark:text-white hover:underline font-bold">
                    contact Nilay here
                  </Link>.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
