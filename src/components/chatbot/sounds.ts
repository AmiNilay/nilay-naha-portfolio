/**
 * Soft UI sounds synthesized with the Web Audio API — no audio files to load.
 * Every sound is a short sine/triangle envelope at low volume. Muted unless the
 * visitor turns sound on (persisted in localStorage).
 */

export type SoundName = "open" | "close" | "send" | "receive" | "happy" | "excited" | "sad" | "confused" | "thinking";

const STORAGE_KEY = "chatbot_sound_enabled";
const MASTER_GAIN = 0.06;

let ctx: AudioContext | null = null;

export function isSoundEnabled() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSoundEnabled(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
  } catch {}
}

function audio() {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as any).webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

/** One note: frequency glide from `from` to `to` Hz, starting `delay` seconds from now. */
function note(ac: AudioContext, from: number, to: number, delay: number, duration: number, type: OscillatorType = "sine", volume = 1) {
  const start = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, start);
  osc.frequency.exponentialRampToValueAtTime(to, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(MASTER_GAIN * volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

const SOUNDS: Record<SoundName, (ac: AudioContext) => void> = {
  open: (ac) => { note(ac, 523, 523, 0, 0.12); note(ac, 784, 784, 0.08, 0.18); },
  close: (ac) => { note(ac, 784, 523, 0, 0.16, "sine", 0.8); },
  send: (ac) => { note(ac, 880, 1175, 0, 0.07, "triangle", 0.6); },
  receive: (ac) => { note(ac, 988, 988, 0, 0.09, "sine", 0.7); note(ac, 1319, 1319, 0.06, 0.12, "sine", 0.6); },
  happy: (ac) => { note(ac, 659, 659, 0, 0.1); note(ac, 784, 784, 0.09, 0.1); note(ac, 1047, 1047, 0.18, 0.18); },
  excited: (ac) => { note(ac, 784, 1047, 0, 0.1, "triangle"); note(ac, 1047, 1568, 0.1, 0.16, "triangle", 0.8); },
  sad: (ac) => { note(ac, 494, 440, 0, 0.22, "sine", 0.8); note(ac, 440, 349, 0.2, 0.32, "sine", 0.7); },
  confused: (ac) => { note(ac, 523, 659, 0, 0.12, "triangle", 0.7); note(ac, 659, 523, 0.12, 0.14, "triangle", 0.6); },
  thinking: (ac) => { note(ac, 698, 698, 0, 0.06, "sine", 0.4); },
};

export function playSound(name: SoundName) {
  if (!isSoundEnabled()) return;
  const ac = audio();
  if (!ac) return;
  try {
    SOUNDS[name](ac);
  } catch {}
}
