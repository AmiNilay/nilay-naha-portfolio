"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Download,
  ExternalLink,
  Mail,
  MessageSquare,
  Search,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";
import Link from "next/link";

interface LinkItem {
  label: string;
  url: string;
}

interface Rule {
  keywords: string[];
  suggestedQuestion?: string;
  answer: string;
  quickReplies?: string[];
  links?: LinkItem[];
}

interface Message {
  id: string;
  role: "bot" | "user";
  content: string;
  quickReplies?: string[];
  links?: LinkItem[];
  isResumeTrigger?: boolean;
}

const FALLBACK_SUGGESTED_QUESTIONS = [
  "What projects have you built?",
  "What languages do you know?",
  "Download Resume",
  "Why should we hire you?",
  "Contact Nilay",
  "What backend technologies do you use?",
  "Tell me about your education.",
  "What APIs have you developed?",
  "What makes your projects unique?",
  "Are you available for opportunities?",
];

const INITIAL_SUGGESTION_COUNT = 5;
const DEFAULT_EMAIL = "niloynaha2003@gmail.com";
const DEFAULT_LINKEDIN = "https://www.linkedin.com/in/nilay-naha/";

const getLevenshteinDistance = (a: string, b: string) => {
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const arr = [];
  for (let i = 0; i <= b.length; i++) {
    arr[i] = [i];
    for (let j = 1; j <= a.length; j++) {
      arr[i][j] =
        i === 0
          ? j
          : Math.min(
              arr[i - 1][j] + 1,
              arr[i][j - 1] + 1,
              arr[i - 1][j - 1] + (a[j - 1] === b[i - 1] ? 0 : 1)
            );
    }
  }

  return arr[b.length][a.length];
};

const STOP_WORDS = [
  "what",
  "is",
  "the",
  "have",
  "you",
  "in",
  "do",
  "a",
  "an",
  "to",
  "for",
  "of",
  "my",
  "your",
];

const isFuzzyMatch = (input: string, keyword: string) => {
  const inputLower = input.toLowerCase();
  const keywordLower = keyword.toLowerCase();
  const inputWords = inputLower
    .split(/\s+/)
    .filter((word) => !STOP_WORDS.includes(word));
  const keywordWords = keywordLower
    .split(/\s+/)
    .filter((word) => !STOP_WORDS.includes(word));

  if (inputLower.includes(keywordLower)) return true;

  for (const keywordWord of keywordWords) {
    if (keywordWord.length < 3) continue;

    for (const inputWord of inputWords) {
      if (getLevenshteinDistance(keywordWord, inputWord) <= 2) return true;
    }
  }

  return false;
};

const isContactRequest = (text: string) => {
  const normalized = text.toLowerCase();
  const contactPhrases = [
    "contact nilay",
    "message nilay",
    "send a message",
    "send this message",
    "send message",
    "email nilay",
    "talk to nilay",
    "reach nilay",
    "get in touch",
    "linkedin",
  ];

  return contactPhrases.some((phrase) => normalized.includes(phrase));
};

const getAdminSuggestedQuestions = (rules: Rule[]) =>
  Array.from(
    new Set(
      rules
        .map((rule) => rule.suggestedQuestion?.trim())
        .filter((question): question is string => Boolean(question))
    )
  );

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [rules, setRules] = useState<Rule[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const [contactLinks, setContactLinks] = useState<LinkItem[]>([
    { label: "Email Nilay", url: `mailto:${DEFAULT_EMAIL}` },
    { label: "LinkedIn", url: DEFAULT_LINKEDIN },
  ]);
  const [showGreeting, setShowGreeting] = useState(true);
  const [suggestionPool, setSuggestionPool] = useState<string[]>(
    FALLBACK_SUGGESTED_QUESTIONS
  );
  const [visibleSuggestions, setVisibleSuggestions] = useState<string[]>(
    () => FALLBACK_SUGGESTED_QUESTIONS.slice(0, INITIAL_SUGGESTION_COUNT)
  );
  const [usedSuggestions, setUsedSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const responseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      content: "Hi! I'm Nilay's virtual assistant. How can I help you today?",
    },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(false), 7000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadChatbotData = async () => {
      try {
        const [rulesResponse, heroResponse] = await Promise.all([
          fetch("/api/chatbot"),
          fetch("/api/hero"),
        ]);

        if (rulesResponse.ok) {
          const rulesData = await rulesResponse.json();
          const loadedRules: Rule[] = Array.isArray(rulesData.rules)
            ? rulesData.rules
            : [];
          const adminSuggestedQuestions = getAdminSuggestedQuestions(loadedRules);
          const nextSuggestionPool = adminSuggestedQuestions.length
            ? adminSuggestedQuestions
            : FALLBACK_SUGGESTED_QUESTIONS;

          setRules(loadedRules);
          setSuggestionPool(nextSuggestionPool);
          setUsedSuggestions([]);
          setVisibleSuggestions(
            nextSuggestionPool.slice(0, INITIAL_SUGGESTION_COUNT)
          );
        }

        if (heroResponse.ok) {
          const heroData = await heroResponse.json();
          const liveResumeUrl =
            heroData?.resumeUrl || heroData?.gDriveResume || "";

          if (liveResumeUrl) setResumeUrl(liveResumeUrl);

          setContactLinks([
            {
              label: "Email Nilay",
              url: `mailto:${heroData?.socialEmail || DEFAULT_EMAIL}`,
            },
            {
              label: "LinkedIn",
              url: heroData?.socialLinkedin || DEFAULT_LINKEDIN,
            },
          ]);
        }
      } catch (error) {
        console.error("Chatbot data loading error:", error);
      }
    };

    loadChatbotData();

    return () => {
      if (responseTimerRef.current) clearTimeout(responseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const suggestions =
    input.trim().length > 1
      ? Array.from(new Set(rules.flatMap((rule) => rule.keywords)))
          .filter((keyword) =>
            keyword.toLowerCase().includes(input.toLowerCase())
          )
          .slice(0, 3)
      : [];

  const handleSuggestionClick = (question: string) => {
    if (isTyping) return;

    const remainingSuggestions = visibleSuggestions.filter(
      (suggestion) => suggestion !== question
    );
    let nextUsedSuggestions = [...usedSuggestions, question];
    let replacementCandidates = suggestionPool.filter(
      (suggestion) =>
        !nextUsedSuggestions.includes(suggestion) &&
        !remainingSuggestions.includes(suggestion)
    );

    if (replacementCandidates.length === 0) {
      nextUsedSuggestions = [question];
      replacementCandidates = suggestionPool.filter(
        (suggestion) =>
          suggestion !== question &&
          !remainingSuggestions.includes(suggestion)
      );
    }

    if (replacementCandidates.length === 0) {
      const nextCycleSuggestions = suggestionPool.filter(
        (suggestion) => suggestion !== question
      );
      setUsedSuggestions(nextUsedSuggestions);
      setVisibleSuggestions(
        nextCycleSuggestions.slice(0, INITIAL_SUGGESTION_COUNT)
      );
    } else {
      const replacement = replacementCandidates[0];
      setUsedSuggestions(nextUsedSuggestions);
      setVisibleSuggestions([...remainingSuggestions, replacement]);
    }

    handleSend(question);
  };

  const handleSend = (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText || isTyping) return;

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        id: `${Date.now()}-user`,
        role: "user",
        content: trimmedText,
      },
    ]);
    setInput("");
    setIsTyping(true);

    responseTimerRef.current = setTimeout(() => {
      let responseText =
        "I don't have a reliable answer for that yet. Please contact Nilay directly by email or LinkedIn.";
      let quickReplies: string[] = [];
      let links: LinkItem[] = [];
      let isResumeTrigger = false;

      if (isContactRequest(trimmedText)) {
        responseText =
          "Direct message sending from this chatbot is coming soon. Please contact Nilay on LinkedIn or email him directly.";
        links = contactLinks;
      } else if (
        isFuzzyMatch(trimmedText, "resume") ||
        isFuzzyMatch(trimmedText, "cv") ||
        isFuzzyMatch(trimmedText, "download")
      ) {
        if (resumeUrl) {
          responseText =
            "Here is Nilay's current resume. You can view it or download it using the buttons below.";
          isResumeTrigger = true;
        } else {
          responseText =
            "Nilay's resume is not available right now. Please contact him by email or LinkedIn.";
          links = contactLinks;
        }
      } else {
        let bestRule: Rule | null = null;
        let highestScore = 0;

        rules.forEach((rule) => {
          let score = 0;

          rule.keywords.forEach((keyword) => {
            if (isFuzzyMatch(trimmedText, keyword)) score += 1;
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
        } else {
          links = contactLinks;
        }
      }

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          id: `${Date.now()}-bot`,
          role: "bot",
          content: responseText,
          quickReplies,
          links,
          isResumeTrigger,
        },
      ]);
      setIsTyping(false);
      responseTimerRef.current = null;
    }, 850);
  };

  return (
    <>
      <AnimatePresence>
        {showGreeting && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="fixed bottom-[5.5rem] right-4 z-50 w-[min(250px,calc(100vw-2rem))] rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 shadow-[0_14px_40px_rgba(0,0,0,0.18)] dark:border-emerald-900/60 dark:bg-zinc-900 dark:!text-white sm:right-6"
          >
            <span className="relative z-10">
              Hi! I&apos;m Nilay&apos;s assistant. How can I help?
            </span>
            <span className="absolute -bottom-2 right-7 h-4 w-4 rotate-45 border-b border-r border-emerald-200 bg-white dark:border-emerald-900/60 dark:bg-zinc-900" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Open Nilay's chatbot"
        className={`fixed bottom-4 right-4 z-50 flex items-center justify-center rounded-full bg-gradient-to-br from-zinc-950 to-zinc-700 p-4 !text-white shadow-[0_12px_40px_rgba(0,0,0,0.24)] transition-all dark:from-white dark:to-zinc-200 dark:!text-zinc-900 sm:bottom-6 sm:right-6 ${
          isOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <MessageSquare className="h-6 w-6" />
        <motion.span
          animate={{ scale: [1, 1.18, 1], opacity: [1, 0.75, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-zinc-950 bg-emerald-500 dark:border-white"
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="fixed bottom-3 right-3 z-50 flex h-[calc(100dvh-1.5rem)] max-h-[720px] w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)] dark:border-zinc-800 dark:bg-zinc-950 sm:bottom-6 sm:right-6 sm:h-[600px] sm:w-[380px]"
          >
            <div className="relative flex items-center justify-between overflow-hidden border-b border-zinc-100 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 p-4 text-white dark:border-zinc-800 dark:from-zinc-100 dark:via-white dark:to-zinc-200 dark:text-zinc-900">
              <motion.div
                animate={{ x: [0, 14, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-emerald-400/20 blur-2xl"
              />
              <div className="relative flex items-center gap-3">
                <div className="relative rounded-2xl bg-white/15 p-2.5 text-white backdrop-blur dark:bg-zinc-900/10 dark:!text-zinc-900">
                  <Bot className="h-5 w-5 !text-white dark:!text-zinc-900" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-zinc-900 bg-emerald-500 dark:border-white" />
                </div>
                <div>
                  <h3 className="!text-sm !font-bold !text-white dark:!text-zinc-900">
                    Nilay&apos;s Assistant
                  </h3>
                  <p className="flex items-center gap-1 text-[10px] font-medium !text-white/80 dark:!text-zinc-600">
                    <Sparkles className="h-3 w-3 !text-emerald-300 dark:!text-emerald-700" />
                    AI Powered
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ rotate: 90, scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                aria-label="Close chatbot"
                className="relative rounded-full p-2 !text-white/80 transition-colors hover:bg-white/10 hover:!text-white dark:!text-zinc-600 dark:hover:bg-zinc-900/10 dark:hover:!text-zinc-900"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            <div className="relative flex-1 space-y-5 overflow-y-auto bg-gradient-to-b from-zinc-50 to-white p-4 dark:from-zinc-900/70 dark:to-zinc-950">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "bot" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-zinc-200 text-zinc-700 shadow-sm dark:bg-zinc-800 dark:text-zinc-300">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div className="flex max-w-[82%] flex-col gap-2">
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                        message.role === "user"
                          ? "rounded-br-sm bg-zinc-950 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "rounded-bl-sm border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                      }`}
                    >
                      {message.content}
                    </div>

                    {message.links && message.links.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {message.links.map((link, index) => (
                          <motion.a
                            key={`${link.url}-${index}`}
                            whileHover={{ y: -1, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            href={link.url}
                            target={
                              link.url.startsWith("mailto:")
                                ? undefined
                                : "_blank"
                            }
                            rel={
                              link.url.startsWith("mailto:")
                                ? undefined
                                : "noopener noreferrer"
                            }
                            className="flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                          >
                            {link.url.startsWith("mailto:") ? (
                              <Mail className="h-3.5 w-3.5" />
                            ) : (
                              <ExternalLink className="h-3.5 w-3.5" />
                            )}
                            {link.label}
                          </motion.a>
                        ))}
                      </div>
                    )}

                    {message.isResumeTrigger && resumeUrl && (
                      <div className="grid grid-cols-2 gap-2">
                        <motion.a
                          whileHover={{ y: -1, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          href={resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
                        >
                          View Resume <ExternalLink className="h-3.5 w-3.5" />
                        </motion.a>
                        <motion.a
                          whileHover={{ y: -1, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          href={resumeUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-600 px-3 py-2.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                        >
                          Download <Download className="h-3.5 w-3.5" />
                        </motion.a>
                      </div>
                    )}

                    {message.quickReplies && message.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {message.quickReplies.map((quickReply, index) => (
                          <motion.button
                            key={`${quickReply}-${index}`}
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.96 }}
                            disabled={isTyping}
                            onClick={() => handleSend(quickReply)}
                            className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                          >
                            {quickReply}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>

                  {message.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-zinc-200 text-zinc-600 shadow-sm dark:bg-zinc-800 dark:text-zinc-400">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-zinc-200 text-zinc-700 shadow-sm dark:bg-zinc-800 dark:text-zinc-300">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse text-emerald-500" />
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Thinking...
                    </span>
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400"
                        style={{ animationDelay: "0.15s" }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </span>
                  </div>
                </motion.div>
              )}

              {!isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-1"
                >
                  <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                    <Sparkles className="h-3 w-3 text-emerald-500" />
                    Suggested questions
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {visibleSuggestions.map((question) => (
                      <motion.button
                        key={question}
                        whileHover={{ y: -1, scale: 1.01 }}
                        whileTap={{ scale: 0.96 }}
                        disabled={isTyping}
                        onClick={() => handleSuggestionClick(question)}
                        className="rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 shadow-sm transition-all hover:border-emerald-400 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-emerald-950/30"
                      >
                        {question}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {suggestions.length > 0 && (
              <div className="absolute bottom-[92px] left-4 right-4 z-20 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion}-${index}`}
                    onClick={() => handleSend(suggestion)}
                    className="flex w-full items-center gap-2 border-b border-zinc-100 px-4 py-3 text-left text-sm text-zinc-700 transition-colors last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <Search className="h-3 w-3 text-zinc-400" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <div className="relative z-10 border-t border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSend(input);
                }}
                className="relative flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 rounded-2xl border border-transparent bg-zinc-100 py-3 pl-4 pr-12 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-500 focus:border-emerald-400 focus:bg-white dark:bg-zinc-900 dark:text-white dark:focus:bg-zinc-950"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  aria-label="Send message"
                  className="absolute right-2 rounded-xl bg-zinc-950 p-2 text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </form>

              <div className="mt-3 text-center">
                <p className="text-[10px] font-medium text-zinc-500">
                  Automated assistant. For direct communication, please{" "}
                  <Link
                    href="/contact"
                    onClick={() => setIsOpen(false)}
                    className="font-bold text-zinc-900 hover:underline dark:text-white"
                  >
                    contact Nilay here
                  </Link>
                  .
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// The chatbot reads the current resume from /api/hero using resumeUrl first
// and gDriveResume as the fallback, independent of admin-trained chatbot rules.
// Direct-message requests return the LinkedIn/email contact fallback while
// the future in-chat messaging feature is not yet available.
// Suggested questions are loaded from admin-managed chatbot rules when present.
// Each clicked suggestion is replaced by an unused question before the pool
// cycles again, while free typing remains enabled at all times.
