/**
 * Free, on-device voice and translation helpers for the chat widget.
 * Speech uses the Web Speech API; translation uses the browser's built-in
 * Translator / LanguageDetector APIs (Chrome 138+). Nothing leaves the device
 * beyond what the browser itself does for speech recognition.
 */

export type ChatLang = "en" | "hi" | "bn" | "ta" | "te" | "mr" | "es" | "fr" | "de";

export const LANGUAGES: { code: ChatLang; label: string; speech: string }[] = [
  { code: "en", label: "English", speech: "en-IN" },
  { code: "hi", label: "हिन्दी", speech: "hi-IN" },
  { code: "bn", label: "বাংলা", speech: "bn-IN" },
  { code: "ta", label: "தமிழ்", speech: "ta-IN" },
  { code: "te", label: "తెలుగు", speech: "te-IN" },
  { code: "mr", label: "मराठी", speech: "mr-IN" },
  { code: "es", label: "Español", speech: "es-ES" },
  { code: "fr", label: "Français", speech: "fr-FR" },
  { code: "de", label: "Deutsch", speech: "de-DE" },
];

export const speechLocale = (lang: ChatLang) => LANGUAGES.find((l) => l.code === lang)?.speech || "en-IN";

/** Script-based detection for Indian languages; LanguageDetector API for the rest. */
export async function detectLanguage(text: string): Promise<ChatLang | null> {
  if (/[ঀ-৿]/.test(text)) return "bn";
  if (/[஀-௿]/.test(text)) return "ta";
  if (/[ఀ-౿]/.test(text)) return "te";
  if (/[ऀ-ॿ]/.test(text)) return "hi"; // Marathi shares Devanagari; picker overrides.
  const w = globalThis as any;
  if (!("LanguageDetector" in w) || text.length < 12) return null;
  try {
    const detector = await w.LanguageDetector.create();
    const [top] = await detector.detect(text);
    const code = top?.detectedLanguage as ChatLang;
    return top?.confidence > 0.6 && LANGUAGES.some((l) => l.code === code) ? code : null;
  } catch {
    return null;
  }
}

const translators = new Map<string, Promise<any>>();

export function translationSupported() {
  return typeof self !== "undefined" && "Translator" in self;
}

/** Translate on-device; returns null when the browser can't (caller falls back to English). */
export async function translate(text: string, from: ChatLang, to: ChatLang): Promise<string | null> {
  if (from === to) return text;
  if (!translationSupported()) return null;
  const T = (self as any).Translator;
  const key = `${from}>${to}`;
  try {
    if (!translators.has(key)) {
      const availability = await T.availability({ sourceLanguage: from, targetLanguage: to });
      if (availability === "unavailable") return null;
      translators.set(key, T.create({ sourceLanguage: from, targetLanguage: to }));
    }
    const translator = await translators.get(key);
    // Translate line by line so markdown structure (bullets, bold, blank lines) survives.
    const lines = await Promise.all(
      text.split("\n").map(async (line) => {
        const m = line.match(/^(\s*(?:[-*]|\d+\.)\s+)?(.*)$/)!;
        if (!m[2].trim()) return line;
        return (m[1] || "") + (await translator.translate(m[2]));
      })
    );
    return lines.join("\n");
  } catch {
    translators.delete(key);
    return null;
  }
}

/** Plain text for speech: no markdown symbols, links or emoji clutter. */
export function stripMarkdown(md: string) {
  return md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#>]+/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[\uD83C-\uDBFF][\uDC00-\uDFFF]|[☀-➿]/g, "")
    .replace(/\n{2,}/g, ". ")
    .trim();
}

export function speak(text: string, lang: ChatLang) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(stripMarkdown(text));
  u.lang = speechLocale(lang);
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(u.lang.slice(0, 2).toLowerCase()));
  if (voice) u.voice = voice;
  u.rate = 1;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

export function getRecognition(): any | null {
  if (typeof window === "undefined") return null;
  const R = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return R ? new R() : null;
}

const SPEAK_KEY = "chatbot_speak_enabled";
const LANG_KEY = "chatbot_lang";

export const loadSpeakPref = () => {
  try {
    return localStorage.getItem(SPEAK_KEY) === "1";
  } catch {
    return false;
  }
};
export const saveSpeakPref = (on: boolean) => {
  try {
    localStorage.setItem(SPEAK_KEY, on ? "1" : "0");
  } catch {}
};
export const loadLangPref = (): ChatLang => {
  try {
    const v = localStorage.getItem(LANG_KEY) as ChatLang;
    return LANGUAGES.some((l) => l.code === v) ? v : "en";
  } catch {
    return "en";
  }
};
export const saveLangPref = (lang: ChatLang) => {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {}
};
