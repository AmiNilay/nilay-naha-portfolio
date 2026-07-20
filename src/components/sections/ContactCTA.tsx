"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Mail } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function ContactCTA() {
  return (
    <section className="py-24 px-4 text-center">
      <AnimatedSection direction="up">
        <h2 className="text-4xl font-bold mb-6">Have a project in mind?</h2>
      </AnimatedSection>

      <AnimatedSection direction="up" delay={0.15}>
        <p className="text-muted-foreground text-xl mb-8 max-w-2xl mx-auto">
          I&apos;m currently available for freelance work and full-time opportunities.
          Let&apos;s build something scalable together.
        </p>
      </AnimatedSection>

      <AnimatedSection direction="up" delay={0.3}>
        <Link href="/contact">
          <Button size="lg" className="gap-2">
            <Mail size={18} /> Get in Touch
          </Button>
        </Link>
      </AnimatedSection>
    </section>
  );
}