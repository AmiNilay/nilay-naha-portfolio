import { cache } from "react";
import { connectToDB } from "@/lib/connectToDB";
import Hero from "@/models/Hero";

/**
 * Hero document as plain JSON — the same shape `/api/hero` returns, so it can
 * seed the client cache under the "hero_data" key. Wrapped in React `cache`
 * so `generateMetadata` and the page share a single query per request.
 */
export const getHeroData = cache(async (): Promise<Record<string, any> | null> => {
  try {
    await connectToDB();
    const hero = await Hero.findOne().lean();
    return hero ? JSON.parse(JSON.stringify(hero)) : {};
  } catch (error) {
    console.error("Failed to load hero data:", error);
    return null;
  }
});
