import { Suspense } from "react";
import type { Metadata } from "next";
import TailoredResumeClient from "./TailoredResumeClient";

export const metadata: Metadata = {
  title: "Tailored Résumé",
  description: "A one-page résumé of Nilay Naha, reordered for a specific job description and built from his live portfolio.",
  robots: { index: false },
};

export default function Page() {
  // useSearchParams() in the client needs a Suspense boundary (Next 14.1+).
  return (
    <Suspense>
      <TailoredResumeClient />
    </Suspense>
  );
}
