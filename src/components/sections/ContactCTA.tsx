import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function ContactCTA() {
    return (
        <section className="py-24 px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Have a project in mind?</h2>
            <p className="text-muted-foreground text-xl mb-8 max-w-2xl mx-auto">
                I'm currently available for freelance work and full-time opportunities.
                Let's build something scalable together.
            </p>
            <Link href="/contact">
                <Button size="lg" className="gap-2">
                    <Mail size={18} /> Get in Touch
                </Button>
            </Link>
        </section>
    );
}