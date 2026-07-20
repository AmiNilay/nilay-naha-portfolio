import type { Metadata } from "next";
import ProjectsClient from "./ProjectsClient";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore projects by Nilay Naha — including ShortDesk (URL shortener), Flask YouTube Downloader, and other Python & full-stack applications.",
  openGraph: {
    title: "Projects by Nilay Naha",
    description:
      "A collection of backend, full-stack, and Python projects built by Nilay Naha.",
    url: "/projects",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <ProjectsClient />;
}