import type { Metadata } from "next";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tutorials, deep-dives, and articles by Nilay Naha on Python, backend development, APIs, and modern web technologies.",
  openGraph: {
    title: "Blog by Nilay Naha",
    description:
      "Tutorials and tech insights on backend development, Python, and web engineering.",
    url: "/blog",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <BlogClient />;
}