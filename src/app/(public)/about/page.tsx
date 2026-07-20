import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Me",
  description:
    "Learn about Nilay Naha — a Software Developer focused on backend development with Python, FastAPI, Node.js, and MongoDB. Education, skills, and journey.",
  openGraph: {
    title: "About Nilay Naha",
    description:
      "Software Developer specializing in Python backend, REST APIs, and full-stack development.",
    url: "/about",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <AboutClient />;
}