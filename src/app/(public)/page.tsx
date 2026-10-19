import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { connectToDB } from "@/lib/connectToDB";
import Hero from "@/models/Hero";

export const revalidate = 60; // Revalidate every minute or on on-demand purge

export async function generateMetadata(): Promise<Metadata> {
  const fallbackTitle = "Nilay Naha - Software Engineer";
  const fallbackDesc =
    "Portfolio of Nilay Naha — Software Engineer specializing in scalable backends, FastAPI, Node.js, and modern full-stack web applications.";

  try {
    await connectToDB();
    const hero: any = await Hero.findOne().lean();

    const title = hero?.siteTitle?.trim() || fallbackTitle;
    const description = hero?.subtitle?.trim() || fallbackDesc;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: "/",
        images: ["/og-image.png"],
      },
      twitter: {
        title,
        description,
        images: ["/og-image.png"],
      },
    };
  } catch {
    return {
      title: fallbackTitle,
      description: fallbackDesc,
    };
  }
}

export default function Page() {
  return <HomeClient />;
}