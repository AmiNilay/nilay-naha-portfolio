import { isAdminRequest } from "@/lib/adminAuth";

/**
 * Draft visibility rules shared by every public surface (API, pages, chatbot,
 * sitemap, llms.txt). Posts are public only when `published === true`;
 * projects are public unless `status === "Draft"`.
 */
export const PUBLISHED_POST = { published: true } as const;
export const PUBLISHED_PROJECT = { status: { $ne: "Draft" } } as const;

export const isPublicPost = (p: any) => p?.published === true;
export const isPublicProject = (p: any) => p?.status !== "Draft";

/**
 * Admin screens request `?all=1`; drafts are returned only when that flag is
 * set AND the request carries a valid admin session. Without the flag even the
 * logged-in owner sees exactly what visitors see.
 */
export async function includeDrafts(req: Request): Promise<boolean> {
  return new URL(req.url).searchParams.get("all") === "1" && (await isAdminRequest(req));
}
