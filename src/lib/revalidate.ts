import { revalidatePath, revalidateTag } from "next/cache";
import { invalidateKnowledge } from "@/lib/chatEngine";
import { PUBLIC_DATA_TAG } from "@/lib/publicCache";

/**
 * Purge every ISR-cached public page, the cached public API datasets and the
 * chatbot's knowledge base after a CMS edit, so changes appear on the live site
 * and in assistant answers immediately.
 */
export function revalidatePublicPages() {
  revalidatePath("/", "layout");
  revalidateTag(PUBLIC_DATA_TAG);
  invalidateKnowledge();
}
