/**
 * Chatbot mascot configuration: expression names, 2D fallback images and the
 * names the optional GLB model is expected to use (see MASCOT_PIPELINE.md).
 */

/** Emotions the chat engine / widget can request. */
export type AvatarEmotion =
  | "neutral" | "happy" | "excited" | "thinking" | "confused" | "sad" | "surprised" | "sleepy" | "annoyed";

/** Everything the mascot can show: emotions plus activity states. */
export type MascotExpression = AvatarEmotion | "explaining" | "coding" | "listening" | "talking";

export type MascotTheme = "light" | "dark" | "auto";
export type MascotAnimation = "idle" | "none";

const EXPRESSIONS: readonly MascotExpression[] = [
  "neutral", "happy", "excited", "thinking", "confused", "sad", "surprised", "sleepy", "annoyed",
  "explaining", "coding", "listening", "talking",
];

export const isExpression = (v: unknown): v is MascotExpression =>
  typeof v === "string" && (EXPRESSIONS as readonly string[]).includes(v);

/** Path of the optional real 3D model. When absent, the 2D renders are used. */
export const MASCOT_GLB_URL = "/models/chatbot-mascot.glb";

/** 2D renders cropped from the reference sheet (public/mascot). */
type Pose = "neutral" | "happy" | "thinking" | "explaining" | "coding";

const POSE_FOR: Record<MascotExpression, Pose> = {
  neutral: "neutral",
  listening: "neutral",
  sleepy: "neutral",
  happy: "happy",
  excited: "happy",
  thinking: "thinking",
  confused: "thinking",
  sad: "thinking",
  annoyed: "thinking",
  explaining: "explaining",
  talking: "explaining",
  surprised: "explaining",
  coding: "coding",
};

export function mascotImage(expression: MascotExpression, size: number, theme: "light" | "dark", icon: boolean) {
  const px = size > 96 ? 256 : 128;
  const name = icon && POSE_FOR[expression] === "neutral" ? `avatar-${theme}` : POSE_FOR[expression];
  return `/mascot/${name}-${px}.webp`;
}

/** Morph targets (shape keys) the GLB may provide; each is optional. */
export const MORPH_FOR: Partial<Record<MascotExpression, Record<string, number>>> = {
  happy: { happy: 1 },
  excited: { happy: 1, mouthOpen: 0.4 },
  thinking: { thinking: 1 },
  confused: { thinking: 0.7 },
  sad: { sad: 1 },
  surprised: { surprised: 1, mouthOpen: 0.6 },
  sleepy: { blink: 0.6 },
  annoyed: { annoyed: 1 },
  explaining: { happy: 0.4, mouthOpen: 0.3 },
  talking: { mouthOpen: 0.5 },
};

/** Animation clips the GLB may provide; falls back to "Idle", then the first clip. */
export const CLIP_FOR: Partial<Record<MascotExpression, string>> = {
  thinking: "Thinking",
  confused: "Thinking",
  explaining: "Explaining",
  talking: "Talking",
  coding: "Coding",
  happy: "Happy",
  excited: "Happy",
  listening: "Listening",
};

export const MASCOT_LABEL = "AI coding assistant";
