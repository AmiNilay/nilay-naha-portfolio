/**
 * Chatbot mascot configuration. The mascot is a single static image — no 3D,
 * no expression swaps — so it costs one small request and no extra JavaScript.
 * To change the mascot, replace this file path (put the image in /public).
 */

/** Emotions the chat engine / widget can request (drive sounds and copy, not the image). */
export type AvatarEmotion =
  | "neutral" | "happy" | "excited" | "thinking" | "confused" | "sad" | "surprised" | "sleepy" | "annoyed";

/** The mascot picture shown on the launcher, chat header and messages. */
export const MASCOT_IMAGE = "/mascot/avatar-light-256.webp";

export const MASCOT_LABEL = "Nilay's assistant";
