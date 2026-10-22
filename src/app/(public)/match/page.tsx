import type { Metadata } from "next";
import MatchClient from "./MatchClient";

export const metadata: Metadata = {
  title: "Job Match",
  description: "Paste a job description and see how Nilay Naha's skills and projects match it — with evidence from his portfolio.",
  openGraph: {
    title: "Does Nilay fit your role? — Job Match",
    description: "An instant, explainable match score built from Nilay Naha's live portfolio.",
    url: "/match",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <MatchClient />;
}
