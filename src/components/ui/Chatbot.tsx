"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, ArrowUp, RotateCcw, Volume2, VolumeX, Download, ExternalLink, ArrowUpRight, Mic, Square, AudioLines, MoreHorizontal, Languages, Check } from "lucide-react";
import ChatbotMascot, { type AvatarEmotion } from "@/components/chatbot/ChatbotMascot";
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

// Claude-style playful loading words, rotated while an answer is on its way.
const SPINNER_VERBS = [
  "Thinking", "Pondering", "Rummaging through projects", "Consulting the résumé", "Connecting the dots",
  "Brewing", "Cross-referencing", "Skimming the commits", "Mulling it over", "Untangling",
  "Compiling thoughts", "Digging through the portfolio", "Noodling", "Percolating", "Fact-checking",
  "Polishing the answer", "Synthesizing", "Flipping through the blog", "Wrangling details", "Booping the database",
];

/** Rotating "Pondering…" label: random start, new word every ~1.4 s, crossfades unless reduced motion. */
function SpinnerVerb({ reduceMotion }: { reduceMotion: boolean }) {
  const [i, setI] = useState(() => Math.floor(Math.random() * SPINNER_VERBS.length));
  useEffect(() => {
    const id = setInterval(
      () => setI((prev) => (prev + 1 + Math.floor(Math.random() * (SPINNER_VERBS.length - 1))) % SPINNER_VERBS.length),
      1400
    );
    return () => clearInterval(id);
  }, []);
  return (
    <span className="relative inline-flex min-w-0 text-[13.5px] italic text-[#8A877E] dark:text-[#A3A097]" aria-hidden>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={i}
          initial={reduceMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="truncate"
        >
          {SPINNER_VERBS[i]}…
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

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
    "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[13px] border border-[#D97757]/35 text-[#B4532F] dark:text-[#E8957A] hover:bg-[#D97757]/10 transition-colors";
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
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

  // Settings popover closes on any outside click.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [menuOpen]);

  // Composer grows with its content (up to ~5 lines).
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input, isOpen]);

  const open = () => {
    setIsOpen(true);
    setTeaserDismissed(true);
    feel("surprised", 900, "open");
    setTimeout(() => setEmotion((e) => (e === "surprised" ? "happy" : e)), 900);
    setTimeout(() => setEmotion((e) => (e === "happy" ? "neutral" : e)), 3200);
  };

  const close = () => {
    setIsOpen(false);
    setMenuOpen(false);
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
      // The hero fetch may still be in flight on slow connections: wait for it instead of guessing.
      const uploaded =
        resumeUrl ||
        (await fetchWithSessionCache<any>("hero_data", "/api/hero")
          .then((h) => h?.resumeUrl || (h?.gDriveResume ? toDriveView(h.gDriveResume) : ""))
          .catch(() => ""));
      // No uploaded PDF → the one-page résumé generated from the live portfolio.
      const content = await localize(
        uploaded
          ? "Here's Nilay's latest résumé — tap below to view or download it."
          : "Here's Nilay's one-page résumé, generated from his live portfolio — tap below to view or save it as PDF."
      );
      say(content);
      addBot({
        content,
        resumeUrl: uploaded || "/resume/tailored",
        quickReplies: ["How can I contact him?", "What projects has he built?"],
      });
      feel("happy", 3500, "happy");
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: ask, context: contextRef.current, language: lang, path: pathname }),
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
    setMenuOpen(false);
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
  const status = listening ? "Listening…" : waiting ? "Thinking…" : "Answers from this portfolio";

  return (
    <>
      {/* Invisible viewport bounds for dragging the launcher. */}
      <div ref={dragBounds} className="fixed inset-3 pointer-events-none z-[59]" aria-hidden />

      {/* Launcher: the 3D character itself, no backdrop disc */}
      <motion.div
        drag
        dragConstraints={dragBounds}
        dragMomentum={false}
        dragElastic={0.15}
        onDragStart={() => (dragged.current = true)}
        onDragEnd={() => setTimeout(() => (dragged.current = false), 50)}
        className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-[60] touch-none"
      >
        <AnimatePresence>
          {!isOpen && !teaserDismissed && (
            <motion.div
              key={teaser}
              initial={{ opacity: 0, x: 8, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.95 }}
              className="absolute right-[calc(100%+6px)] bottom-6 hidden sm:flex items-center gap-2 whitespace-nowrap pl-3.5 pr-2 py-2 rounded-2xl rounded-br-md bg-[#FAF9F5]/95 dark:bg-[#30302E]/95 backdrop-blur-xl border border-[#E8E4DA] dark:border-[#3D3D3A] shadow-lg text-[13px] text-[#1F1E1D] dark:text-[#F5F4EF]"
            >
              <button onClick={open} className="text-left">
                {TEASERS[teaser]}
              </button>
              <button
                onClick={() => setTeaserDismissed(true)}
                aria-label="Dismiss"
                className="p-0.5 rounded-full text-[#8A877E] hover:text-[#1F1E1D] dark:hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={onLauncherClick}
         
          onHoverStart={() => !isOpen && emotion !== "thinking" && feel("happy", 1800)}
          whileHover={reduceMotion ? undefined : { scale: 1.06, y: -2 }}
          whileTap={reduceMotion ? undefined : { scale: 0.94 }}
          aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
          aria-expanded={isOpen}
          className="relative block bg-transparent rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D97757]"
        >
          <ChatbotMascot size={76} />
          {!isOpen && (
            <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#262624]" aria-hidden />
          )}
        </motion.button>
      </motion.div>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.section
            role="dialog"
            aria-label="Chat with Nilay's assistant"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            // Phones / short screens: full-screen sheet above the navbar (safe-area aware).
            // Tablets and up: floating panel above the launcher, larger on 2xl and TVs.
            className="fixed z-[70] inset-0 h-[100dvh] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] float:z-[60] float:inset-auto float:pt-0 float:pb-0 float:bottom-28 float:right-5 float:w-[430px] float:h-[660px] float:max-h-[calc(100dvh-9rem)] float:rounded-[24px] float:border 2xl:w-[480px] 2xl:h-[740px] tv:w-[600px] tv:h-[920px] tv:text-lg flex flex-col overflow-hidden bg-[#FAF9F5] dark:bg-[#262624] text-[#1F1E1D] dark:text-[#F5F4EF] border-[#E8E4DA] dark:border-[#3D3D3A] float:shadow-[0_28px_80px_-16px_rgba(31,30,29,0.35)]"
          >
            {/* Header */}
            <header className="relative flex items-center gap-3 pl-4 pr-2.5 py-3 border-b border-[#EDE9DF] dark:border-[#34342F]">
              <ChatbotMascot size={44} />
              <div className="min-w-0 flex-1">
                <p className="font-serif text-[17px] leading-tight tracking-[-0.01em] whitespace-nowrap">Nilay&apos;s Assistant</p>
                <p className="mt-0.5 text-xs text-[#6B6860] dark:text-[#A3A097] flex items-center gap-1.5 whitespace-nowrap">
                  <span className={`w-1.5 h-1.5 rounded-full ${listening ? "bg-rose-500 animate-pulse" : waiting ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                  {status}
                </p>
              </div>

              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Chat settings"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  title="Settings"
                  className="p-2 rounded-xl text-[#6B6860] dark:text-[#A3A097] hover:text-[#1F1E1D] dark:hover:text-white hover:bg-[#F0EEE6] dark:hover:bg-[#30302E] transition-colors"
                >
                  <MoreHorizontal className="w-[18px] h-[18px]" />
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.14 }}
                      className="absolute right-0 top-[calc(100%+6px)] z-10 w-60 p-1.5 rounded-2xl bg-white dark:bg-[#30302E] border border-[#E8E4DA] dark:border-[#3D3D3A] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.3)]"
                    >
                      <label className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px]">
                        <Languages className="w-4 h-4 text-[#6B6860] dark:text-[#A3A097] shrink-0" />
                        <span className="flex-1">Language</span>
                        <select
                          value={lang}
                          onChange={(e) => changeLang(e.target.value as ChatLang)}
                          aria-label="Answer language"
                          className="max-w-[110px] px-2 py-1 rounded-lg text-xs bg-[#F0EEE6] dark:bg-[#262624] border-none focus:outline-none focus:ring-2 focus:ring-[#D97757]/40"
                        >
                          {LANGUAGES.map((l) => (
                            <option key={l.code} value={l.code}>
                              {l.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <MenuItem
                        icon={<AudioLines className="w-4 h-4" />}
                        label="Read answers aloud"
                        checked={speakOn}
                        onClick={toggleSpeak}
                      />
                      <MenuItem
                        icon={soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        label="Sound effects"
                        checked={soundOn}
                        onClick={toggleSound}
                      />
                      <div className="my-1 h-px bg-[#EDE9DF] dark:bg-[#3D3D3A]" />
                      <MenuItem icon={<RotateCcw className="w-4 h-4" />} label="Start a new chat" onClick={reset} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={close}
                aria-label="Close chat"
                className="p-2 rounded-xl text-[#6B6860] dark:text-[#A3A097] hover:text-[#1F1E1D] dark:hover:text-white hover:bg-[#F0EEE6] dark:hover:bg-[#30302E] transition-colors"
              >
                <X className="w-[18px] h-[18px]" />
              </button>
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 sm:py-6 space-y-5 sm:space-y-6 overscroll-contain" aria-live="polite">
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <p className="max-w-[85%] px-4 py-2.5 rounded-[20px] bg-[#F0EEE6] dark:bg-[#393937] text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                      {m.content}
                    </p>
                  </div>
                ) : (
                  <div key={m.id} className="flex gap-3">
                    <div className="shrink-0 mt-0.5 w-7 h-7 flex items-center justify-center">
                      <ChatbotMascot size={28} />
                    </div>
                    <div className="min-w-0 flex-1 text-[15px] leading-[1.7] text-[#2B2A27] dark:text-[#E8E6DF] space-y-3">
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
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D97757] hover:bg-[#C6613F] text-white text-sm font-medium shadow-sm transition-colors"
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
                <div className="flex gap-3 items-center">
                  <div className="shrink-0 w-7 h-7 flex items-center justify-center">
                    <ChatbotMascot size={28} />
                  </div>
                  <div className="flex gap-1.5 py-2 shrink-0" role="status" aria-label="Assistant is thinking">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-2 h-2 rounded-full bg-[#D97757]"
                        animate={{ scale: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                  <SpinnerVerb reduceMotion={!!reduceMotion} />
                </div>
              )}

              {showStarters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {STARTERS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-left px-4 py-3 rounded-2xl border border-[#E8E4DA] dark:border-[#3D3D3A] bg-white/60 dark:bg-[#30302E]/60 text-[13.5px] leading-snug text-[#3D3B36] dark:text-[#D6D3CA] hover:border-[#D97757]/50 hover:bg-white dark:hover:bg-[#30302E] transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {!waiting && last.role === "bot" && !last.animate && (last.quickReplies?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2 pl-10">
                  {last.quickReplies!.slice(0, 3).map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="px-3.5 py-1.5 rounded-full text-[13px] border border-[#E8E4DA] dark:border-[#3D3D3A] text-[#3D3B36] dark:text-[#D6D3CA] hover:border-[#D97757]/50 hover:bg-white dark:hover:bg-[#30302E] transition-colors"
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
              className="px-4 pb-3 pt-2"
            >
              <div className="rounded-[22px] bg-white dark:bg-[#30302E] border border-[#E2DDD1] dark:border-[#45453F] shadow-[0_2px_10px_-4px_rgba(31,30,29,0.12)] focus-within:border-[#D97757]/60 transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  rows={1}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  maxLength={500}
                  placeholder={listening ? "Listening…" : "Ask about projects, skills, experience…"}
                  aria-label="Your question"
                  className="block w-full resize-none bg-transparent px-4 pt-3.5 pb-1 text-base sm:text-[15px] leading-relaxed placeholder:text-[#9A968C] focus:outline-none"
                />
                <div className="flex items-center justify-end gap-1.5 px-2.5 pb-2.5">
                  {voiceSupported && (
                    <button
                      type="button"
                      onClick={toggleListening}
                      disabled={waiting}
                      aria-label={listening ? "Stop voice input" : "Ask with your voice"}
                      aria-pressed={listening}
                      title={listening ? "Stop voice input" : "Ask with your voice"}
                      className={`p-2 rounded-xl transition-colors disabled:opacity-40 ${listening ? "bg-rose-500 text-white animate-pulse" : "text-[#6B6860] dark:text-[#A3A097] hover:text-[#1F1E1D] dark:hover:text-white hover:bg-[#F0EEE6] dark:hover:bg-[#393937]"}`}
                    >
                      {listening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!input.trim() || waiting}
                    aria-label="Send"
                    className="p-2 rounded-xl bg-[#D97757] hover:bg-[#C6613F] text-white disabled:bg-[#E8D5CC] dark:disabled:bg-[#4A3F3A] disabled:text-white/80 transition-colors"
                  >
                    <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-center text-[11px] text-[#9A968C]">Answers come from Nilay&apos;s portfolio content.</p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}

function MenuItem({ icon, label, checked, onClick }: { icon: React.ReactNode; label: string; checked?: boolean; onClick: () => void }) {
  return (
    <button
      role={checked === undefined ? "menuitem" : "menuitemcheckbox"}
      aria-checked={checked}
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] text-left hover:bg-[#F0EEE6] dark:hover:bg-[#393937] transition-colors"
    >
      <span className="text-[#6B6860] dark:text-[#A3A097]">{icon}</span>
      <span className="flex-1">{label}</span>
      {checked && <Check className="w-4 h-4 text-[#D97757]" />}
    </button>
  );
}
