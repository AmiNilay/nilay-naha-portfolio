import { revalidatePath } from "next/cache";

/**
 * Purge every ISR-cached public page after a CMS edit, so changes appear on
 * the live site immediately instead of after the 60s revalidation window.
 */
export function revalidatePublicPages() {
  revalidatePath("/", "layout");
}
