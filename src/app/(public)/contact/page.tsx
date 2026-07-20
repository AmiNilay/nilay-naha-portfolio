import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Nilay Naha for freelance projects, collaborations, or full-time opportunities.",
  openGraph: {
    title: "Contact Nilay Naha",
    description:
      "Reach out for freelance work, collaborations, or opportunities.",
    url: "/contact",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <ContactClient />;
}