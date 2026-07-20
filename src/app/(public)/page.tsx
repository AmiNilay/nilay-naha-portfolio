import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Nilay Naha - Software Developer (Python)",
  description:
    "Portfolio of Nilay Naha — a Python & Backend Developer specializing in FastAPI, Node.js, MongoDB, and full-stack projects. Explore projects, articles, and get in touch.",
  openGraph: {
    title: "Nilay Naha - Software Developer (Python)",
    description:
      "Explore projects, articles, and the developer journey of Nilay Naha — building clean, scalable backend systems.",
    url: "/",
    images: ["/og-image.png"],
  },
  twitter: {
    title: "Nilay Naha - Software Developer (Python)",
    description:
      "Explore projects, articles, and the developer journey of Nilay Naha.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <HomeClient />;
}