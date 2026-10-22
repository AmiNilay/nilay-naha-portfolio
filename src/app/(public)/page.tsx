import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { getHeroData } from "@/lib/publicData";
import { getProfile, SITE_URL } from "@/lib/profileData";

export const revalidate = 60; // Revalidate every minute or on on-demand purge

export async function generateMetadata(): Promise<Metadata> {
  const fallbackTitle = "Nilay Naha - Software Engineer";
  const fallbackDesc =
    "Portfolio of Nilay Naha — Software Engineer specializing in scalable backends, FastAPI, Node.js, and modern full-stack web applications.";

  try {
    const hero = await getHeroData();

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

// schema.org Person markup so search engines understand who the site is about.
async function personJsonLd() {
  const p = await getProfile();
  if (!p) return null;
  const sameAs = [p.hero.socialGithub, p.hero.socialLinkedin, p.hero.socialTwitter, p.hero.socialInstagram].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Nilay Naha",
    url: SITE_URL,
    jobTitle: p.current?.role || "Software Engineer",
    ...(p.current && { worksFor: { "@type": "Organization", name: p.current.company } }),
    ...(p.location && { address: { "@type": "PostalAddress", addressLocality: p.location } }),
    ...(p.hero.socialEmail && { email: `mailto:${p.hero.socialEmail}` }),
    ...(sameAs.length && { sameAs }),
    ...(p.education.length && {
      alumniOf: p.education.map((e: any) => ({ "@type": "EducationalOrganization", name: e.institution })),
    }),
    ...(p.skills.length && { knowsAbout: p.skills }),
  };
}

export default async function Page() {
  const [hero, jsonLd] = await Promise.all([getHeroData(), personJsonLd()]);
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // Escape "<" so CMS text can never close the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      <HomeClient initialHero={hero} />
    </>
  );
}