import type { Metadata } from "next";
import { SITE_URL } from "@/lib/profileData";
import ApiDocsClient from "./ApiDocsClient";

export const metadata: Metadata = {
  title: "API Docs | Nilay Naha",
  description: "Interactive OpenAPI / Swagger documentation for Nilay Naha's portfolio backend: public, recruiter, AI/MCP and CMS endpoints.",
  alternates: { canonical: `${SITE_URL}/api-docs` },
};

export default function ApiDocsPage() {
  return <ApiDocsClient siteUrl={SITE_URL} />;
}
