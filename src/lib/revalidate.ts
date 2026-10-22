import { revalidatePath } from "next/cache";
import { invalidateKnowledge } from "@/lib/chatEngine";

/**
 * Purge every ISR-cached public page and the chatbot's knowledge base after a
 * CMS edit, so changes appear on the live site and in assistant answers immediately.
 */
export function revalidatePublicPages() {
  revalidatePath("/", "layout");
  invalidateKnowledge();
}
