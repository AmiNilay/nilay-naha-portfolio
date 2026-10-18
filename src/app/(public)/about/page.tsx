import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Nilay Naha — Software Developer specializing in Python, backend architecture, REST APIs, and full-stack engineering.",
  openGraph: {
    title: "About Nilay Naha — Software Developer",
    description:
      "Engineering philosophy, background, education, experience, and technical arsenal of Nilay Naha.",
    url: "/about",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <AboutClient />;
}
