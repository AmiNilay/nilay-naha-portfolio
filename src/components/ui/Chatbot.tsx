"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, Send, RotateCcw, Volume2, VolumeX, Download, ExternalLink, ArrowUpRight, Mic, Square, AudioLines } from "lucide-react";
import HumanAvatar, { type AvatarEmotion } from "@/components/chatbot/HumanAvatar";
import MessageContent from "@/components/chatbot/MessageContent";
import { playSound, isSoundEnabled, setSoundEnabled, type SoundName } from "@/components/chatbot/sounds";
import { fetchWithSessionCache } from "@/lib/clientCache";
import {
  LANGUAGES,
  type ChatLang,
  detectLanguage,
  translate,
  speak,
  stopSpeaking,
  getRecognition,
  speechLocale,
  loadSpeakPref,
  saveSpeakPref,
  loadLangPref,
  saveLangPref,
} from "@/components/chatbot/language";

const NO_TRANSLATION_NOTE =
  "Replying in English — translation runs on-device and needs a recent Chrome or Edge browser.";

interface LinkItem {
  label: string;
  url: string;
}

interface Message {
  id: string;
  role: "bot" | "user";
  content: string;
  links?: LinkItem[];
  quickReplies?: string[];
  resumeUrl?: string;
  animate?: boolean;
}

interface Rule {
  keywords: string[];
  answer: string;
  quickReplies?: string[];
  links?: LinkItem[];
}

const STARTERS = [
  "Give me a quick overview",
  "What projects has he built?",
  "What's his tech stack?",
  "Can I see his resume?",
];

const TEASERS = [
  "Hi! Ask me anything about Nilay 👋",
  "Curious about his projects? 🚀",
  "Need Nilay's resume? Just ask 📄",
];

const WELCOME: Message = {
  id: "welcome",
  role: "bot",
  content:
    "Hi, I'm Nilay's assistant 👋\n\nI can answer questions about his **projects**, **experience**, **skills** and **education** — or share his résumé and contact details. What would you like to know?",
};

const RESUME_PATTERN = /\b(resume|résumé|cv|curriculum vitae)\b/i;
const IDLE_SLEEP_MS = 45_000;

// Offline fallback only: simple keyword overlap against the curated rules.
function localRuleAnswer(question: string, rules: Rule[]) {
  const words = question.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);
  let best: Rule | null = null;
  let bestScore = 0;
  for (const rule of rules) {
    const score = rule.keywords.reduce((s, k) => {
      const kw = k.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);
      return s + kw.filter((w) => words.includes(w)).length / Math.max(1, kw.length);
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      best = rule;
    }
  }
  return bestScore >= 0.5 ? best : null;
}

const toDriveView = (url: string) => {
  const id = url.match(/[-\w]{25,}/)?.[0];
  return url.includes("drive.google.com") && id ? `https://drive.google.com/file/d/${id}/view` : url;
};

function LinkChip({ link }: { link: LinkItem }) {
  const internal = link.url.startsWith("/");
  const className =
    "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-cyan-500/30 bg-cyan-500/5 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/15 transition-colors";
  return internal ? (
    <Link href={link.url} className={className}>
      {link.label}
      <ArrowUpRight className="w-3 h-3" />
    </Link>
  ) : (
    <a href={link.url} target="_blank" rel="noopener noreferrer" className={className}>
      {link.label}
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}

// Fallback follow-up questions, used when an answer's own suggestions were already asked.
const FOLLOW_UP_POOL = [
  "What projects has he built?",
  "What's his tech stack?",
  "Tell me about his experience",
  "What has he written about?",
  "What's his education?",
  "How can I contact him?",
];

export default function Chatbot() {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [emotion, setEmotion] = useState<AvatarEmotion>("neutral");
  const [soundOn, setSoundOn] = useState(false);
  const [teaser, setTeaser] = useState(0);
  const [teaserDismissed, setTeaserDismissed] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const [rules, setRules] = useState<Rule[]>([]);
  const [lang, setLang] = useState<ChatLang>("en");
  const [speakOn, setSpeakOn] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  const contextRef = useRef<string | undefined>(undefined);
  const askedRef = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emotionTimer = useRef<ReturnType<typeof setTimeout>>();
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();
  const clicks = useRef<number[]>([]);
  const dragged = useRef(false);
  const dragBounds = useRef<HTMLDivElement>(null);

  const feel = useCallback((next: AvatarEmotion, holdMs = 3500, sound?: SoundName) => {
    clearTimeout(emotionTimer.current);
    setEmotion(next);
    if (sound) playSound(sound);
    if (holdMs > 0) emotionTimer.current = setTimeout(() => setEmotion("neutral"), holdMs);
  }, []);

  // Sleepy when ignored for a while (only while closed).
  const resetIdle = useCallback(() => {
    clearTimeout(idleTimer.current);
    setEmotion((e) => (e === "sleepy" ? "neutral" : e));
    idleTimer.current = setTimeout(() => setEmotion((e) => (e === "neutral" ? "sleepy" : e)), IDLE_SLEEP_MS);
  }, []);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
    setSpeakOn(loadSpeakPref());
    setLang(loadLangPref());
    setVoiceSupported(Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));
    fetchWithSessionCache<any>("hero_data", "/api/hero")
      .then((h) => setResumeUrl(h?.resumeUrl || (h?.gDriveResume ? toDriveView(h.gDriveResume) : "")))
      .catch(() => {});
    resetIdle();
    window.addEventListener("pointerdown", resetIdle, { passive: true });
    window.addEventListener("keydown", resetIdle);
    return () => {
      window.removeEventListener("pointerdown", resetIdle);
      window.removeEventListener("keydown", resetIdle);
      clearTimeout(idleTimer.current);
      clearTimeout(emotionTimer.current);
    };
  }, [resetIdle]);

  useEffect(() => {
    if (isOpen || teaserDismissed) return;
    const id = setInterval(() => setTeaser((t) => (t + 1) % TEASERS.length), 6000);
    return () => clearInterval(id);
  }, [isOpen, teaserDismissed]);

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => inputRef.current?.focus(), 250);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const scrollToEnd = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);
  useEffect(scrollToEnd, [messages, waiting, scrollToEnd]);

  const open = () => {
    setIsOpen(true);
    setTeaserDismissed(true);
    feel("surprised", 900, "open");
    setTimeout(() => setEmotion((e) => (e === "surprised" ? "happy" : e)), 900);
    setTimeout(() => setEmotion((e) => (e === "happy" ? "neutral" : e)), 3200);
  };

  const close = () => {
    setIsOpen(false);
    stopSpeaking();
    recognitionRef.current?.abort?.();
    setListening(false);
    playSound("close");
  };

  const onLauncherClick = () => {
    if (dragged.current) return;
    const now = Date.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 1200), now];
    if (clicks.current.length >= 5) {
      clicks.current = [];
      feel("annoyed", 2500, "confused");
      return;
    }
    if (isOpen) close();
    else open();
  };

  const addBot = (msg: Omit<Message, "id" | "role">) =>
    setMessages((prev) => [...prev, { id: `${Date.now()}-b`, role: "bot", animate: !reduceMotion, ...msg }]);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || waiting) return;
    setMessages((prev) => [...prev, { id: `${Date.now()}-u`, role: "user", content: text }]);
    askedRef.current.add(text.toLowerCase());
    setInput("");
    setWaiting(true);
    playSound("send");
    feel("thinking", 0);
    const minDelay = new Promise((r) => setTimeout(r, 450));

    // Non-English questions are translated on-device to English, and answers back.
    const replyLang: ChatLang = (await detectLanguage(text)) || lang;
    let ask = text;
    let note = "";
    if (replyLang !== "en") {
      const english = await translate(text, replyLang, "en");
      if (english) ask = english;
      else note = NO_TRANSLATION_NOTE;
    }
    const localize = async (content: string) => {
      if (replyLang === "en" || note) return content;
      const out = await translate(content, "en", replyLang);
      if (out) return out;
      note = NO_TRANSLATION_NOTE;
      return content;
    };
    const say = (content: string) => speakOn && speak(content, note ? "en" : replyLang);

    if (RESUME_PATTERN.test(text) || RESUME_PATTERN.test(ask)) {
      await minDelay;
      setWaiting(false);
      if (resumeUrl) {
        const content = await localize("Here's Nilay's latest résumé — tap below to view or download it.");
        say(content);
        addBot({
          content,
          resumeUrl,
          quickReplies: ["How can I contact him?", "What projects has he built?"],
        });
        feel("happy", 3500, "happy");
      } else {
        addBot({ content: "Nilay hasn't uploaded a résumé yet — please reach out through the contact page.", links: [{ label: "Contact page", url: "/contact" }] });
        feel("sad", 3500, "sad");
      }
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: ask, context: contextRef.current }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const localized = await localize(data.reply);
      const reply = note ? `${localized}\n\n_${note}_` : localized;
      await minDelay;
      contextRef.current = data.context || contextRef.current;
      setWaiting(false);
      // Suggest follow-ups the visitor hasn't asked yet, topping up from the general pool.
      const suggestions = Array.from(new Set<string>([...(data.quickReplies || []), ...FOLLOW_UP_POOL])).filter(
        (q) => !askedRef.current.has(q.toLowerCase())
      );
      const goTo: string | undefined = data.navigate && data.navigate !== pathname ? data.navigate : undefined;
      addBot({
        content: goTo ? `${reply}\n\n_Opening it for you…_` : reply,
        links: data.links,
        quickReplies: suggestions.slice(0, 3),
      });
      say(localized);
      if (goTo) setTimeout(() => router.push(goTo), 1200);
      // "Not on the portfolio" answers read as apologetic, not puzzled.
      const mood: AvatarEmotion = data.emotion === "confused" ? "sad" : data.emotion || "happy";
      feel(mood, 4000, mood === "thinking" ? "receive" : (mood as SoundName));
    } catch {
      // Offline / server error: answer from curated rules if possible.
      let pool = rules;
      if (!pool.length) {
        try {
          pool = (await (await fetch("/api/chatbot")).json()).rules || [];
          setRules(pool);
        } catch {}
      }
      await minDelay;
      setWaiting(false);
      const rule = localRuleAnswer(text, pool);
      if (rule) {
        addBot({ content: rule.answer, links: rule.links, quickReplies: rule.quickReplies });
        feel("happy", 3500, "receive");
      } else {
        addBot({
          content: "Sorry — I'm having trouble connecting right now. Please try again in a moment, or reach Nilay through the contact page.",
          links: [{ label: "Contact page", url: "/contact" }],
        });
        feel("sad", 4000, "sad");
      }
    }
  };

  const reset = () => {
    setMessages([WELCOME]);
    contextRef.current = undefined;
    feel("happy", 1500, "receive");
  };

  const toggleSpeak = () => {
    const next = !speakOn;
    setSpeakOn(next);
    saveSpeakPref(next);
    if (!next) stopSpeaking();
  };

  const changeLang = (next: ChatLang) => {
    setLang(next);
    saveLangPref(next);
  };

  // Speech-to-text in the chosen language; the final transcript is sent as a question.
  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = getRecognition();
    if (!rec) return;
    stopSpeaking();
    rec.lang = speechLocale(lang);
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    let finalText = "";
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }
      setInput((finalText + interim).trim());
    };
    rec.onend = () => {
      setListening(false);
      setEmotion((e) => (e === "surprised" ? "neutral" : e));
      if (finalText.trim()) send(finalText);
    };
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    feel("surprised", 0);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) playSound("happy");
  };

  if (pathname?.startsWith("/admin")) return null;

  const last = messages[messages.length - 1];
  const showStarters = messages.length === 1 && !waiting;

  return (
    <>
      {/* Invisible viewport bounds for dragging the launcher. */}
      <div ref={dragBounds} className="fixed inset-3 pointer-events-none z-[59]" aria-hidden />

      {/* Launcher */}
      <motion.div
        drag
        dragConstraints={dragBounds}
        dragMomentum={false}
        dragElastic={0.15}
        onDragStart={() => (dragged.current = true)}
        onDragEnd={() => setTimeout(() => (dragged.current = false), 50)}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[60] touch-none"
      >
        <AnimatePresence>
          {!isOpen && !teaserDismissed && (
            <motion.div
              key={teaser}
              initial={{ opacity: 0, x: 8, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.95 }}
              className="absolute right-[calc(100%+10px)] bottom-3 hidden sm:flex items-center gap-2 whitespace-nowrap pl-3.5 pr-2 py-2 rounded-2xl rounded-br-md bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-lg text-xs font-semibold text-zinc-800 dark:text-zinc-100"
            >
              <button onClick={open} className="text-left">{TEASERS[teaser]}</button>
              <button
                onClick={() => setTeaserDismissed(true)}
                aria-label="Dismiss"
                className="p-0.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={onLauncherClick}
          tabIndex={0}
          onHoverStart={() => !isOpen && emotion !== "thinking" && feel("happy", 1800)}
          whileHover={reduceMotion ? undefined : { scale: 1.06 }}
          whileTap={reduceMotion ? undefined : { scale: 0.94 }}
          aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
          aria-expanded={isOpen}
          className="relative block rounded-full shadow-[0_10px_30px_-6px_rgba(79,70,229,0.55)] ring-4 ring-white dark:ring-zinc-900 focus:outline-none focus-visible:ring-cyan-400"
        >
          <HumanAvatar emotion={emotion} size={60} />
          {!isOpen && (
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" aria-hidden />
          )}
        </motion.button>
      </motion.div>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.section
            role="dialog"
            aria-label="Chat with Nilay's assistant"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed z-[60] inset-x-2 top-16 bottom-24 sm:inset-auto sm:bottom-28 sm:right-6 sm:w-[400px] sm:h-[620px] sm:max-h-[calc(100dvh-9rem)] flex flex-col rounded-[28px] overflow-hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-[0_24px_70px_-12px_rgba(0,0,0,0.35)]"
          >
            {/* Header */}
            <header className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200/70 dark:border-zinc-800">
              <HumanAvatar emotion={emotion} size={44} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">Nilay&apos;s Assistant</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${waiting ? "bg-amber-400 animate-pulse" : "bg-emerald-500"}`} />
                  {listening ? "Listening…" : waiting ? "Thinking…" : "Answers from this portfolio"}
                </p>
              </div>
              <select
                value={lang}
                onChange={(e) => changeLang(e.target.value as ChatLang)}
                aria-label="Answer language"
                title="Answer language"
                className="max-w-[84px] px-1.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-none focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
              <button
                onClick={toggleSpeak}
                aria-label={speakOn ? "Stop reading answers aloud" : "Read answers aloud"}
                aria-pressed={speakOn}
                title={speakOn ? "Stop reading answers aloud" : "Read answers aloud"}
                className={`p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 ${speakOn ? "text-cyan-600 dark:text-cyan-400" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
              >
                <AudioLines className="w-4 h-4" />
              </button>
              <button
                onClick={toggleSound}
                aria-label={soundOn ? "Mute sounds" : "Turn on sounds"}
                title={soundOn ? "Mute sounds" : "Turn on sounds"}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={reset}
                aria-label="Start over"
                title="Start over"
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={close}
                aria-label="Close chat"
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-5 overscroll-contain" aria-live="polite">
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <p className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[14px] leading-relaxed whitespace-pre-wrap">
                      {m.content}
                    </p>
                  </div>
                ) : (
                  <div key={m.id} className="flex gap-2.5">
                    <div className="shrink-0 mt-0.5">
                      <HumanAvatar emotion={m === last ? emotion : "neutral"} size={28} track={false} />
                    </div>
                    <div className="min-w-0 flex-1 text-zinc-700 dark:text-zinc-300 space-y-3">
                      <MessageContent
                        text={m.content}
                        animate={m.animate && m === last}
                        onProgress={scrollToEnd}
                        onDone={() => setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, animate: false } : x)))}
                      />
                      {m.resumeUrl && (
                        <a
                          href={m.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-sm font-semibold shadow-md hover:opacity-95"
                        >
                          <Download className="w-4 h-4" /> View / download résumé
                        </a>
                      )}
                      {!m.animate && m.links && m.links.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {m.links.map((l) => (
                            <LinkChip key={l.url + l.label} link={l} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}

              {waiting && (
                <div className="flex gap-2.5 items-center">
                  <HumanAvatar emotion="thinking" size={28} track={false} />
                  <div className="flex gap-1 px-3 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-zinc-400"
                        animate={{ y: [0, -3, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {showStarters && (
                <div className="grid grid-cols-1 gap-2 pt-1">
                  {STARTERS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-left px-3.5 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-[13px] font-medium text-zinc-700 dark:text-zinc-300 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {!waiting && last.role === "bot" && !last.animate && (last.quickReplies?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1.5 pl-[38px]">
                  {last.quickReplies!.slice(0, 3).map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="p-3 border-t border-zinc-200/70 dark:border-zinc-800"
            >
              <div className="flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-transparent focus-within:border-cyan-500/40 transition-colors">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={500}
                  placeholder="Ask about projects, skills, experience…"
                  aria-label="Your question"
                  className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
                />
                {voiceSupported && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={waiting}
                    aria-label={listening ? "Stop voice input" : "Ask with your voice"}
                    aria-pressed={listening}
                    title={listening ? "Stop voice input" : "Ask with your voice"}
                    className={`p-2.5 rounded-xl transition-colors disabled:opacity-40 ${listening ? "bg-rose-500 text-white animate-pulse" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"}`}
                  >
                    {listening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!input.trim() || waiting}
                  aria-label="Send"
                  className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white disabled:opacity-40 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-zinc-400">Answers are generated from Nilay&apos;s portfolio content.</p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
